import searchEngine from "../services/search";

/**
 * Gets the input search value "query"
 *
 * @param {Element} inputField - autoComplete input field or textarea element
 * 
 * @returns {String} - Raw input value as a string
 */
const getInputValue = (inputField) => {
  return inputField instanceof HTMLInputElement || inputField instanceof HTMLTextAreaElement
    ? inputField.value.toLowerCase()
    : inputField.innerHTML.toLowerCase();
};

/**
 * Intercept query value
 *
 * @param {String} inputValue - User's raw search query value
 * @param {Object} query - Query Object with the Manipulate function
 *
 * @returns {String} - Manipulated Query Value
 */
const prepareQueryValue = (inputValue, query) => {
  return query && query.manipulate
    ? query.manipulate(inputValue)
    : inputValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
};

/**
 * App triggering condition
 *
 * @param {Object} config - Trigger Object with the Trigger function
 * @param {String} queryValue - User's search query value string after manipulation
 *
 * @returns {Boolean} triggerCondition - For autoComplete trigger decision
 */
const checkTriggerCondition = (config, queryValue) => {
  return config.trigger.condition
    ? config.trigger.condition(queryValue)
    : queryValue.length >= config.threshold && queryValue.replace(/ /g, "").length;
};

/**
 * List search matching results
 *
 * @param {Object} config - The search engine configurations
 * @param {String} query - User's search query string
 *
 * @returns {Array} - The matching results list array
 */
const listMatchingResults = (config, query) => {
  // Final highlighted results list
  const resList = [];
  // Checks input has matches in data source
  for (let index = 0; index < config.data.store.length; index++) {
    const record = config.data.store[index];
    // Search/Matching function
    const search = (key) => {
      // This Record value
      const recordValue = (key ? record[key] : record).toString();
      // Check if record does exist before search
      if (recordValue) {
        // Holds match value
        const match =
          typeof config.searchEngine === "function"
            ? config.searchEngine(query, recordValue)
            : searchEngine(query, recordValue, config);
        // Push match to results list with key if set
        if (match && key) {
          resList.push({
            key,
            index,
            match,
            value: record,
          });
          // Push match to results list without key if not set
        } else if (match && !key) {
          resList.push({
            index,
            match,
            value: record,
          });
        }
      }
    };
    // If no data key not set
    if (config.data.key) {
      // If data key is set
      // Iterates over all set data keys
      for (const key of config.data.key) {
        search(key);
      }
    } else {
      search();
    }
  }
  // Sorting / Slicing final results list
  const list = config.sort ? resList.sort(config.sort) : resList;
  // Returns rendered list
  return list;
};

export { getInputValue, prepareQueryValue, checkTriggerCondition, listMatchingResults };
