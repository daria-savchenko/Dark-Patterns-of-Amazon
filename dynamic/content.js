// Define the dark patterns and their tooltips
const patterns = [
  {
    regex: /\blimited time deal\b/gi,
    tooltip:
      "Urgency: This message is meant to create a sense of urgency, encouraging you to make a quick purchase.",
  },
  {
    regex: /\b\d+K?\+? bought in past month\b/gi,
    tooltip:
      "Social Proof: This message tries to show how popular this product is, encouraging you to buy.",
  },
  {
    regex: /\bbest seller\b/gi,
    tooltip:
      "Social Proof: This designation implies the product is highly popular, increasing its perceived value.",
  },
  {
    regex: /\boverall pick\b/gi,
    tooltip:
      "Social Proof: This label suggests the product has been chosen by experts, influencing your decision to trust it.",
  },
  {
    regex: /\bpopular brand pick\b/gi,
    tooltip:
      "Social Proof: This label suggests the product is associated with a well-known brand, influencing your decision to trust it.",
  },
  {
    selector: ".detailpage-dealBadge-countdown-timer",
    tooltip:
      "Countdown: This countdown timer creates a sense of urgency, pressuring you to make a quick purchase before the time runs out.",
  },
  {
    regex: /\bonly \d+ left in stock\b/gi,
    tooltip:
      "Scarcity: This message suggests that the product is in high demand and may not be available for long, encouraging you to make a quick purchase.",
  },
  {
    regex: /\bGoodreads Choice\b/gi,
    tooltip:
      "Social Proof: This label indicates that the product has been recognized by Goodreads as a top choice, influencing your decision to trust it.",
  },
  {
    regex: /\bHighlighted by \d+ Kindle readers\b/gi,
    tooltip:
      "Social Proof: This message indicates that the product has been highlighted by Kindle readers, influencing your decision to trust it.",
  },
  {
    regex: /\bFrequently bought together\b/gi,
    tooltip:
      "Social Proof: This message indicates that the product is frequently bought together with others, suggesting its popularity and influencing your decision to trust it.",
  },
  {
    regex: /\bCustomers frequently viewed\b/gi,
    tooltip:
      "Social Proof: This message indicates that these product are frequently viewed by others, suggesting their popularity and influencing your decision to trust them.",
  },
  {
    selector: "h1.a-spacing-small",
    textContent: "Sign in",
    tooltip:
      "Forced Enrollment: Requiring sign-in before proceeding forces unnecessary data sharing.",
  },
  {
    regex: /\bdo you miss the fast and free delivery with Prime\b/gi,
    tooltip:
      "Confirm Shaming: This message uses guilt or shame to manipulate you into choosing an option that benefits the company.",
  },
  {
    regex: /\bContinue without free, fast shipping\b/gi,
    tooltip:
      "Confirm Shaming: This message uses guilt or shame to manipulate you into choosing an option that benefits the company.",
  },
  {
    regex: /\bContinue without Prime benefits\b/gi,
    tooltip:
      "Confirm Shaming: This message uses guilt or shame to manipulate you into choosing an option that benefits the company.",
  },
  {
    selector: "#signup-cta-card-inner", // Add selector for the element
    tooltip:
      "Misdirection: This element distracts with flashy visual colors, potentially leading you away from your intended action or focus.",
  },
  {
    regex: /\bwe have selected you for a 30-day FREE period of Prime\b/gi,
    tooltip:
      "Nagging: This message tries to push you into signing up for a Prime membership by offering a free trial, potentially leading to an impulse decision.",
  },
  {
    regex:
      /\bas a Amazon customer you have access to 30 days Amazon Prime for FREE\b/gi,
    tooltip:
      "Nagging: This message tries to push you into signing up for a Prime membership by offering a free trial, potentially leading to an impulse decision.",
  },
];

// Function to highlight dark patterns
function highlightDarkPatterns(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.parentElement?.dataset.darkPattern) {
      // return if node has a dark pattern already
      return
    }
    patterns.forEach((pattern) => {
      if (pattern.regex) {
        // document.querySelectorAll(`[data-dark-pattern]`).forEach(node => node.parentElement.removeChild(node))
        let match;
        while ((match = pattern.regex.exec(node.nodeValue)) !== null) {
          const span = document.createElement("span");
          span.textContent = match[0];
          // span.classList.add("highlight"); // don't use class names, because it could be destroy the website layout; Better use completly custom names, or data attributes
          span.title = pattern.tooltip; // Set tooltip text
          span.dataset.darkPattern = match[0]
          const beforeText = node.nodeValue.substring(0, match.index);
          const afterText = node.nodeValue.substring(
            match.index + match[0].length
          );
          const beforeNode = document.createTextNode(beforeText);
          const afterNode = document.createTextNode(afterText);
          node.parentNode.insertBefore(beforeNode, node);
          node.parentNode.insertBefore(span, node);
          node.parentNode.insertBefore(afterNode, node);
          node.parentNode.removeChild(node);
        }
      }
    });
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName === "SCRIPT") return; // Skip script elements
    patterns.forEach((pattern) => {
      if (pattern.selector) {
        const elements = node.querySelectorAll(pattern.selector);
        elements.forEach((element) => {
          if (
            !pattern.textContent ||
            element.textContent.includes(pattern.textContent)
          ) {
            // element.classList.add("highlight");
            // don't use class names, because it could be destroy the website layout; Better use completly custom names, or data attributes
            element.dataset.darkPatternElement = pattern.selector; // Set tooltip text
            element.title = pattern.tooltip; // Set tooltip text
          }
        });
      }
    });
    node.childNodes.forEach((childNode) => highlightDarkPatterns(childNode));
  }
}

// Function to create toggle
function createToggle() {
  const toggleContainer = document.createElement("div");
  toggleContainer.setAttribute('dark-pattern-toggle-container', '')
  toggleContainer.innerHTML = `
    <label dark-pattern-toggle-label for="dark-pattern-toggle">Enable Dark Pattern Detection</label>
    <input type="checkbox" id="dark-pattern-toggle">
  `;
  document.body.insertBefore(toggleContainer, document.body.firstChild);

  const toggle = document.getElementById("dark-pattern-toggle");
  toggle.checked = localStorage.getItem("darkPatternDetection") === "true";

  toggle.addEventListener("change", function () {
    localStorage.setItem("darkPatternDetection", toggle.checked);
    detectDarkPatterns();
  });
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Function to observe DOM changes and reapply highlights
let observer
function observeDOMChanges() {
  const debouncedHighlight = debounce(
    () => highlightDarkPatterns(document.body),
    300
  );

  observer = new MutationObserver(() => {
    debouncedHighlight();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// Call the function to identify dark patterns on the entire document
function detectDarkPatterns() {
  const darkPatternDetectionEnabled =
    localStorage.getItem("darkPatternDetection") === "true";

  if (darkPatternDetectionEnabled) {
    // Call the function to identify dark patterns on the entire document
    highlightDarkPatterns(document.body);
    // Call the function to observe DOM changes
    observeDOMChanges();
  } else {
    // Remove existing highlights
    observer?.disconnect()
    document.querySelectorAll("[data-dark-pattern]").forEach((element) => {
      const textNode = document.createTextNode(element.textContent)
      element.parentElement.insertBefore(textNode, element)
      element.parentElement.removeChild(element)
    });

    document.querySelectorAll("[data-dark-pattern-element]").forEach((element) => {
      element.removeAttribute('data-dark-pattern-element')
      element.title = null
    });
  }
}

// Call the function to create toggle
createToggle();

detectDarkPatterns();
