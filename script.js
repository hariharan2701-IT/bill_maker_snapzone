window.onload = () => {
  const { jsPDF } = window.jspdf;
  
  // Set today's date as default
  document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
  
  // Initialize total calculation
  updateTotal();

  // Add input event listeners for real-time updates
  document.getElementById('frameAmount').addEventListener('input', updateTotal);
  document.getElementById('quantity').addEventListener('input', updateTotal);
  document.getElementById('courier').addEventListener('change', updateTotal);

  // Phone number formatting
  document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    if (value.length > 0 && !value.startsWith('+91')) {
      value = '+91 ' + value;
    }
    e.target.value = value;
  });
};

function updateTotal() {
  const frameAmount = parseInt(document.getElementById('frameAmount').value) || 0;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const courier = document.getElementById('courier').value;
  
  const subtotal = frameAmount * quantity;
  const courierCharge = courier === 'Yes' ? 70 : 0;
  const grandTotal = subtotal + courierCharge;
  
  document.getElementById('subtotal').textContent = `₹${subtotal}`;
  document.getElementById('courierCharges').textContent = `₹${courierCharge}`;
  document.getElementById('grandTotal').textContent = `₹${grandTotal}`;
}

function validateForm() {
  const requiredFields = ['orderNumber', 'orderDate', 'customerName', 'phone', 'address', 'frameSize', 'frameAmount'];
  const errors = [];
  
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      errors.push(`${field.previousElementSibling.textContent.replace('*', '')} is required`);
      field.style.borderColor = '#ef4444';
    } else {
      field.style.borderColor = '#e2e8f0';
    }
  });
  
  // Validate phone number
  const phone = document.getElementById('phone').value;
  if (phone && !phone.match(/^\+91\s\d{5}\s\d{5}$/)) {
    errors.push('Please enter a valid phone number');
    document.getElementById('phone').style.borderColor = '#ef4444';
  }
  
  // Validate frame amount
  const frameAmount = parseInt(document.getElementById('frameAmount').value);
  if (frameAmount <= 0) {
    errors.push('Frame amount must be greater than 0');
    document.getElementById('frameAmount').style.borderColor = '#ef4444';
  }
  
  if (errors.length > 0) {
    alert('Please fix the following errors:\n\n' + errors.join('\n'));
    return false;
  }
  
  return true;
}

function getFormData() {
  return {
    orderNumber: document.getElementById('orderNumber').value,
    orderDate: document.getElementById('orderDate').value,
    customerName: document.getElementById('customerName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    coimbatore: document.getElementById('coimbatore').value,
    courier: document.getElementById('courier').value,
    frameSize: document.getElementById('frameSize').value,
    frameType: document.getElementById('frameType').value,
    frameAmount: parseInt(document.getElementById('frameAmount').value),
    quantity: parseInt(document.getElementById('quantity').value),
    subtotal: parseInt(document.getElementById('frameAmount').value) * parseInt(document.getElementById('quantity').value),
    courierCharge: document.getElementById('courier').value === 'Yes' ? 70 : 0,
    grandTotal: (parseInt(document.getElementById('frameAmount').value) * parseInt(document.getElementById('quantity').value)) + (document.getElementById('courier').value === 'Yes' ? 70 : 0)
  };
}

function previewInvoice() {
  if (!validateForm()) return;
  
  const data = getFormData();
  const previewContent = document.getElementById('previewContent');
  
  previewContent.innerHTML = `
    <div class="preview-invoice">
      <div class="preview-header">
        <h2>📸 Snapzone Frames</h2>
        <p>Professional Photo Framing Services</p>
        <p><strong>Invoice #${data.orderNumber}</strong></p>
        <p>Date: ${new Date(data.orderDate).toLocaleDateString('en-IN')}</p>
      </div>
      
      <div class="preview-section">
        <h4>Customer Information</h4>
        <div class="preview-row"><span>Name:</span><span>${data.customerName}</span></div>
        <div class="preview-row"><span>Phone:</span><span>${data.phone}</span></div>
        ${data.email ? `<div class="preview-row"><span>Email:</span><span>${data.email}</span></div>` : ''}
        <div class="preview-row"><span>Address:</span><span>${data.address}</span></div>
        <div class="preview-row"><span>Within Coimbatore:</span><span>${data.coimbatore}</span></div>
      </div>
      
      <div class="preview-section">
        <h4>Service Details</h4>
        <div class="preview-row"><span>Frame Size:</span><span>${data.frameSize}</span></div>
        <div class="preview-row"><span>Frame Type:</span><span>${data.frameType}</span></div>
        <div class="preview-row"><span>Quantity:</span><span>${data.quantity}</span></div>
        <div class="preview-row"><span>Unit Price:</span><span>₹${data.frameAmount}</span></div>
        <div class="preview-row"><span>Courier Required:</span><span>${data.courier}</span></div>
      </div>
      
      <div class="preview-total">
        <div class="preview-row"><span>Subtotal:</span><span>₹${data.subtotal}</span></div>
        <div class="preview-row"><span>Courier Charges:</span><span>₹${data.courierCharge}</span></div>
        <div class="preview-row" style="font-weight: bold; font-size: 1.1em; color: #2563eb;">
          <span>Grand Total:</span><span>₹${data.grandTotal}</span>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
}

function generatePDF() {
  if (!validateForm()) return;
  
  const data = getFormData();
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = [37, 99, 235];
  const textColor = [30, 41, 59];
  const lightGray = [148, 163, 184];
  
  // Header with company branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company logo/icon (using text as placeholder)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('📸', 20, 25);
  
  // Company name and tagline
  doc.setFontSize(20);
  doc.text('Snapzone Frames', 35, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Photo Framing Services', 35, 28);
  
  // Invoice details in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 160, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${data.orderNumber}`, 160, 28);
  doc.text(`Date: ${new Date(data.orderDate).toLocaleDateString('en-IN')}`, 160, 35);
  
  // Reset text color for body
  doc.setTextColor(...textColor);
  
  let yPos = 55;
  
  // Customer Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Customer Information', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const customerInfo = [
    `Name: ${data.customerName}`,
    `Phone: ${data.phone}`,
    ...(data.email ? [`Email: ${data.email}`] : []),
    `Address: ${data.address}`,
    `Within Coimbatore: ${data.coimbatore}`
  ];
  
  customerInfo.forEach(info => {
    doc.text(info, 20, yPos);
    yPos += 6;
  });
  
  yPos += 5;
  
  // Service Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Service Details', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const serviceDetails = [
    `Frame Size: ${data.frameSize}`,
    `Frame Type: ${data.frameType}`,
    `Quantity: ${data.quantity}`,
    `Unit Price: ₹${data.frameAmount}`,
    `Courier Required: ${data.courier}`
  ];
  
  serviceDetails.forEach(detail => {
    doc.text(detail, 20, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Payment Summary Table
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos - 5, 170, 25, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Payment Summary', 25, yPos + 2);
  
  yPos += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  // Summary rows
  doc.text('Subtotal:', 25, yPos);
  doc.text(`₹${data.subtotal}`, 160, yPos);
  yPos += 6;
  
  doc.text('Courier Charges:', 25, yPos);
  doc.text(`₹${data.courierCharge}`, 160, yPos);
  yPos += 8;
  
  // Total row with highlight
  doc.setFillColor(...primaryColor);
  doc.rect(20, yPos - 3, 170, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Grand Total:', 25, yPos + 2);
  doc.text(`₹${data.grandTotal}`, 160, yPos + 2);
  
  yPos += 20;
  
  // Footer
  doc.setTextColor(...lightGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing Snapzone Frames!', 20, yPos);
  doc.text('We appreciate your business and look forward to serving you again.', 20, yPos + 6);
  
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Contact Information:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('Phone: +91 77085 54879 / +91 94836 92989', 20, yPos + 6);
  doc.text('Email: info@snapzoneframes.com', 20, yPos + 12);
  
  // Add a subtle border
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.rect(10, 45, 190, yPos - 35);
  
  // Save the PDF
  const fileName = `Snapzone_Invoice_${data.orderNumber}_${data.customerName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  
  // Close preview modal if open
  closePreview();
  
  // Show success message
  setTimeout(() => {
    alert('✅ Invoice generated successfully!\n\nThe PDF has been downloaded to your device.');
  }, 500);
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('previewModal');
  if (event.target === modal) {
    closePreview();
  }