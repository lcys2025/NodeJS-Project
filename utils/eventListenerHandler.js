function setEventListener(selector, eventType, handler, options = false) {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element with selector '${selector}' not found`);
      return false;
    }
    
    element.addEventListener(eventType, handler, options);
    return true;
  } catch (error) {
    console.error('Error setting event listener:', error);
    return false;
  }
}

function clearEventListener(selector, eventType, handler, options = false) {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element with selector '${selector}' not found`);
      return false;
    }
    
    element.removeEventListener(eventType, handler, options);
    return true;
  } catch (error) {
    console.error('Error clearing event listener:', error);
    return false;
  }
}

function setEventListeners(selector, eventType, handler, options = false) {
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      console.warn(`No elements found with selector '${selector}'`);
      return false;
    }
    
    elements.forEach(element => {
      element.addEventListener(eventType, handler, options);
    });
    return true;
  } catch (error) {
    console.error('Error setting event listeners:', error);
    return false;
  }
}

export { setEventListener, clearEventListener, setEventListeners };