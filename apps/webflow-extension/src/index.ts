// MSWD Livelihood Webflow Extension
interface BeneficiaryData {
  name: string;
  program: string;
  status: string;
  barangay: string;
}

let currentBeneficiary: BeneficiaryData | null = null;

// Initialize extension
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  const form = document.getElementById('mswd-form');
  if (form) {
    form.onsubmit = handleFormSubmit;
  }

  const createButton = document.getElementById('create-beneficiary');
  if (createButton) {
    createButton.onclick = createBeneficiaryComponent;
  }
}

async function handleFormSubmit(event: Event) {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  
  currentBeneficiary = {
    name: formData.get('name') as string,
    program: formData.get('program') as string,
    status: formData.get('status') as string,
    barangay: formData.get('barangay') as string,
  };

  await createBeneficiaryComponent();
}

async function createBeneficiaryComponent() {
  if (!currentBeneficiary) return;

  const selectedElement = await webflow.getSelectedElement();
  if (!selectedElement) {
    alert('Please select an element first');
    return;
  }

  try {
    // Create MSWD beneficiary card component
    const cardElement = await selectedElement.append(webflow.elementPresets.DivBlock);
    await cardElement.setStyles([await getOrCreateStyle('mswd-beneficiary-card')]);
    
    // Add beneficiary name
    const nameElement = await cardElement.append(webflow.elementPresets.Heading);
    await nameElement.setTextContent(currentBeneficiary.name);
    await nameElement.setStyles([await getOrCreateStyle('mswd-beneficiary-name')]);
    
    // Add program info
    const programElement = await cardElement.append(webflow.elementPresets.Paragraph);
    await programElement.setTextContent(`Program: ${currentBeneficiary.program}`);
    
    // Add status
    const statusElement = await cardElement.append(webflow.elementPresets.Paragraph);
    await statusElement.setTextContent(`Status: ${currentBeneficiary.status}`);
    
    alert('Beneficiary component created successfully!');
  } catch (error) {
    console.error('Error creating component:', error);
    alert('Failed to create beneficiary component');
  }
}

async function getOrCreateStyle(styleName: string) {
  const existingStyle = await webflow.getStyleByName(styleName);
  if (existingStyle) return existingStyle;

  const newStyle = await webflow.createStyle(styleName);
  
  // Apply MSWD-specific styling
  const styleProperties = getStyleProperties(styleName);
  await newStyle.setProperties(styleProperties);
  
  return newStyle;
}

function getStyleProperties(styleName: string): Record<string, string> {
  const styles: Record<string, Record<string, string>> = {
    'mswd-beneficiary-card': {
      'background-color': '#f8f9fa',
      'border': '1px solid #dee2e6',
      'border-radius': '8px',
      'padding': '16px',
      'margin': '8px 0',
    },
    'mswd-beneficiary-name': {
      'color': '#2c5aa0',
      'font-weight': 'bold',
      'margin-bottom': '8px',
    },
  };
  
  return styles[styleName] || {};
}
