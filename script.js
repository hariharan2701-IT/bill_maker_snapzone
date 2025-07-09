window.onload = () => {
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
    let value = e.target.value;
    
    // Remove all non-digits except the + sign at the beginning
    let cleanValue = value.replace(/[^\d+]/g, '');
    
    // If user starts typing without +91, add it
    if (cleanValue && !cleanValue.startsWith('+91')) {
      // Extract only digits
      let digits = cleanValue.replace(/\D/g, '');
      
      // If it starts with 91, don't add another 91
      if (digits.startsWith('91') && digits.length > 2) {
        digits = digits.substring(2);
      }
      
      // Limit to 10 digits for Indian mobile numbers
      if (digits.length > 10) {
        digits = digits.substring(0, 10);
      }
      
      // Format as +91 XXXXX XXXXX
      if (digits.length > 0) {
        if (digits.length <= 5) {
          cleanValue = '+91 ' + digits;
        } else {
          cleanValue = '+91 ' + digits.substring(0, 5) + ' ' + digits.substring(5);
        }
      } else {
        cleanValue = '+91 ';
      }
    } else if (cleanValue.startsWith('+91')) {
      // Extract digits after +91
      let digits = cleanValue.substring(3).replace(/\D/g, '');
      
      // Limit to 10 digits
      if (digits.length > 10) {
        digits = digits.substring(0, 10);
      }
      
      // Format as +91 XXXXX XXXXX
      if (digits.length > 0) {
        if (digits.length <= 5) {
          cleanValue = '+91 ' + digits;
        } else {
          cleanValue = '+91 ' + digits.substring(0, 5) + ' ' + digits.substring(5);
        }
      } else {
        cleanValue = '+91 ';
      }
    } else if (cleanValue === '') {
      cleanValue = '';
    }
    
    e.target.value = cleanValue;
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
  
  // Ensure jsPDF is available
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    // Try to load jsPDF if not available
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      setTimeout(() => generatePDF(), 100);
    };
    script.onerror = () => {
      alert('Failed to load PDF library. Please check your internet connection and try again.');
    };
    document.head.appendChild(script);
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const data = getFormData();
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = [37, 99, 235];
  const textColor = [30, 41, 59];
  const lightGray = [148, 163, 184];
  const darkGray = [75, 85, 99];
  
  // Header with company branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Company name and details in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SNAPZONE FRAMES', 20, 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Photo Framing Services', 20, 28);
  doc.text('Phone: +91 77085 54879 / +91 94836 92989', 20, 35);
  doc.text('Email: info@snapzoneframes.com', 20, 42);
  
  // Invoice details in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.orderNumber}`, 150, 30);
  doc.text(`Date: ${new Date(data.orderDate).toLocaleDateString('en-IN')}`, 150, 38);
  
  // Reset text color for body
  doc.setTextColor(...textColor);
  
  let yPos = 65;
  
  // Bill To Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  // Customer name in bold
  doc.setFont('helvetica', 'bold');
  doc.text(data.customerName, 20, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.text(data.phone, 20, yPos);
  yPos += 6;
  
  if (data.email) {
    doc.text(data.email, 20, yPos);
    yPos += 6;
  }
  
  // Split address into multiple lines if too long
  const addressLines = doc.splitTextToSize(data.address, 80);
  addressLines.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });
  
  doc.text(`Location: ${data.coimbatore === 'Yes' ? 'Within Coimbatore' : 'Outside Coimbatore'}`, 20, yPos);
  
  yPos += 15;
  
  // Service Details Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 5, 170, 12, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('SERVICE DETAILS', 25, yPos + 2);
  
  yPos += 15;
  
  // Table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('DESCRIPTION', 25, yPos);
  doc.text('SIZE', 90, yPos);
  doc.text('QTY', 120, yPos);
  doc.text('UNIT PRICE', 140, yPos);
  doc.text('AMOUNT', 170, yPos);
  
  yPos += 8;
  
  // Draw line under headers
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(20, yPos - 2, 190, yPos - 2);
  
  yPos += 5;
  
  // Service details row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  doc.text(`${data.frameType} Frame`, 25, yPos);
  doc.text(data.frameSize, 90, yPos);
  doc.text(data.quantity.toString(), 120, yPos);
  doc.text(`₹${data.frameAmount}`, 140, yPos);
  doc.text(`₹${data.subtotal}`, 170, yPos);
  
  yPos += 8;
  
  // Courier service if applicable
  if (data.courier === 'Yes') {
    doc.text('Courier Service', 25, yPos);
    doc.text('-', 90, yPos);
    doc.text('1', 120, yPos);
    doc.text('₹70', 140, yPos);
    doc.text('₹70', 170, yPos);
    yPos += 8;
  }
  
  // Draw line above totals
  doc.line(120, yPos, 190, yPos);
  yPos += 8;
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 140, yPos);
  doc.text(`₹${data.subtotal}`, 170, yPos);
  yPos += 6;
  
  // Courier charges
  doc.text('Courier Charges:', 140, yPos);
  doc.text(`₹${data.courierCharge}`, 170, yPos);
  yPos += 8;
  
  // Total with background
  doc.setFillColor(...primaryColor);
  doc.rect(120, yPos - 5, 70, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 125, yPos + 2);
  doc.text(`₹${data.grandTotal}`, 170, yPos + 2);
  
  yPos += 20;
  
  // Terms and conditions section
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const terms = [
    '• Payment is due within 30 days of invoice date',
    '• All frames are custom made and non-returnable',
    '• Delivery time: 7-10 working days for standard frames',
    '• Customer is responsible for providing high-quality images'
  ];
  
  terms.forEach(term => {
    doc.text(term, 20, yPos);
    yPos += 6;
  });
  
  yPos += 8;
  
  // Footer
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing Snapzone Frames!', 20, yPos);
  
  yPos += 6;
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('We appreciate your business and look forward to serving you again.', 20, yPos);
  
  // Add page border
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(1);
  doc.rect(15, 50, 180, yPos - 40);
  
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
}