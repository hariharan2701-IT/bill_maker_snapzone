import React, { useState, useEffect } from 'react';
import { Camera, FileText, Calendar, User, MapPin, Package, Calculator, Eye, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    orderNumber: '',
    orderDate: '',
    customerName: '',
    email: '',
    address: '',
    coimbatore: 'Yes',
    courier: 'No',
    frameSize: '',
    frameType: 'Standard',
    frameAmount: '',
    quantity: 1
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, orderDate: today }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const calculateTotals = () => {
    const frameAmount = parseInt(formData.frameAmount) || 0;
    const quantity = parseInt(formData.quantity) || 1;
    const subtotal = frameAmount * quantity;
    const courierCharge = formData.courier === 'Yes' ? 70 : 0;
    const grandTotal = subtotal + courierCharge;
    
    return { subtotal, courierCharge, grandTotal };
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['orderNumber', 'orderDate', 'customerName', 'address', 'frameSize', 'frameAmount'];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.frameAmount && parseInt(formData.frameAmount) <= 0) {
      newErrors.frameAmount = 'Frame amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const generatePDF = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);

    try {
      const { subtotal, courierCharge, grandTotal } = calculateTotals();
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
      doc.text('Coimbatores Best Photo Framing Services', 20, 28);
      doc.text('Phone: +91 77085 54879 / +91 94836 92989', 20, 35);
      doc.text('Email: snapzoneframes@gmail.com', 20, 42);

      // Invoice details in header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 150, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: ${formData.orderNumber}`, 150, 30);
      doc.text(`Date: ${new Date(formData.orderDate).toLocaleDateString('en-IN')}`, 150, 38);

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
      doc.text(formData.customerName, 20, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      if (formData.email) {
        doc.text(formData.email, 20, yPos);
        yPos += 6;
      }

      // Split address into multiple lines if too long
      const addressLines = doc.splitTextToSize(formData.address, 80);
      addressLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      doc.text(`Location: ${formData.coimbatore === 'Yes' ? 'Within Coimbatore' : 'Outside Coimbatore'}`, 20, yPos);

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

      doc.text(`${formData.frameType} Frame`, 25, yPos);
      doc.text(formData.frameSize, 90, yPos);
      doc.text(formData.quantity.toString(), 120, yPos);
      doc.text(`₹${formData.frameAmount}`, 140, yPos);
      doc.text(`₹${subtotal}`, 170, yPos);

      yPos += 8;

      // Courier service if applicable
      if (formData.courier === 'Yes') {
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
      doc.text(`₹${subtotal}`, 170, yPos);
      yPos += 6;

      // Courier charges
      doc.text('Courier Charges:', 140, yPos);
      doc.text(`₹${courierCharge}`, 170, yPos);
      yPos += 8;

      // Total with background
      doc.setFillColor(...primaryColor);
      doc.rect(120, yPos - 5, 70, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', 125, yPos + 2);
      doc.text(`₹${grandTotal}`, 170, yPos + 2);

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
        '• Delivery Time: 1–3 working days for standard frame orders.',
        '• Same-Day Delivery available across Tamil Nadu (based on location & time of order).',
        '• All frames are custom-made and therefore non-returnable.',
        '• Cash on Delivery is available only within Coimbatore.',
       '• Please provide high-quality images to ensure the best print and framing results.',
        '• For any queries, contact us at +91 77085 54879 or +91 94836 92989.'
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
      doc.text('we’re grateful for your support and can’t wait to frame more memories for you', 20, yPos);

      // Add page border
      doc.setDrawColor(...lightGray);
      doc.setLineWidth(1);
      doc.rect(15, 50, 180, yPos - 40);

      // Save the PDF
      const fileName = `Snapzone_Invoice_${formData.orderNumber}_${formData.customerName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      // Close preview modal if open
      setShowPreview(false);

      // Show success message
      setTimeout(() => {
        alert('✅ Invoice generated successfully!\n\nThe PDF has been downloaded to your device.');
      }, 300);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('❌ Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const { subtotal, courierCharge, grandTotal } = calculateTotals();

  return (
    <div className="app">
      <div className="background-pattern"></div>
      
      <div className="container">
        <div className="header">
          <div className="logo-section">
            <div className="logo-icon">
              <Camera size={24} />
            </div>
            <div className="company-info">
              <h1>Snapzone Frames</h1>
              <p>Professional Photo Framing Services</p>
            </div>
          </div>
          <div className="invoice-badge">
            <FileText size={20} />
            <span>Invoice Generator</span>
          </div>
        </div>

        <form className="invoice-form" onSubmit={(e) => e.preventDefault()}>
          {/* Order Information */}
          <div className="form-section">
            <h3><Calendar size={20} /> Order Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="orderNumber">Order Number</label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  placeholder="e.g., ORD-2024-001"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  className={errors.orderNumber ? 'error' : ''}
                />
                {errors.orderNumber && <span className="error-message">{errors.orderNumber}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="orderDate">Order Date</label>
                <input
                  type="date"
                  id="orderDate"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  className={errors.orderDate ? 'error' : ''}
                />
                {errors.orderDate && <span className="error-message">{errors.orderDate}</span>}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="form-section">
            <h3><User size={20} /> Customer Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerName">Customer Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  placeholder="Enter full name"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={errors.customerName ? 'error' : ''}
                />
                {errors.customerName && <span className="error-message">{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Complete Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter complete address with pincode"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
          </div>

          {/* Service Details */}
          <div className="form-section">
            <h3><MapPin size={20} /> Service Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="coimbatore">Within Coimbatore?</label>
                <select
                  id="coimbatore"
                  name="coimbatore"
                  value={formData.coimbatore}
                  onChange={handleInputChange}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="courier">Courier Required?</label>
                <select
                  id="courier"
                  name="courier"
                  value={formData.courier}
                  onChange={handleInputChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (+₹70)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Frame Details */}
          <div className="form-section">
            <h3><Package size={20} /> Frame Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frameSize">Frame Size</label>
                <input
                  type="text"
                  id="frameSize"
                  name="frameSize"
                  placeholder="e.g., 8x10, A4, 12x18"
                  value={formData.frameSize}
                  onChange={handleInputChange}
                  className={errors.frameSize ? 'error' : ''}
                />
                {errors.frameSize && <span className="error-message">{errors.frameSize}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="frameType">Frame Type</label>
                <select
                  id="frameType"
                  name="frameType"
                  value={formData.frameType}
                  onChange={handleInputChange}
                >
                  <option value="Standard">Standard Frame</option>
                  <option value="Premium">Premium Frame</option>
                  <option value="Luxury">Luxury Frame</option>
                  <option value="Custom">Custom Frame</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frameAmount">Frame Amount</label>
                <input
                  type="number"
                  id="frameAmount"
                  name="frameAmount"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={formData.frameAmount}
                  onChange={handleInputChange}
                  className={errors.frameAmount ? 'error' : ''}
                />
                {errors.frameAmount && <span className="error-message">{errors.frameAmount}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="form-section">
            <h3><Calculator size={20} /> Payment Summary</h3>
            <div className="payment-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Courier Charges:</span>
                <span>₹{courierCharge}</span>
              </div>
              <div className="summary-row total-row">
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={handlePreview} className="btn-secondary">
              <Eye size={20} />
              Preview Invoice
            </button>
            <button 
              type="button" 
              onClick={generatePDF} 
              className="btn-primary"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download PDF Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invoice Preview</h3>
              <span className="close" onClick={() => setShowPreview(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="preview-invoice">
                <div className="preview-header">
                  <h2>📸 Snapzone Frames</h2>
                  <p>Professional Photo Framing Services</p>
                  <p><strong>Invoice #{formData.orderNumber}</strong></p>
                  <p>Date: {new Date(formData.orderDate).toLocaleDateString('en-IN')}</p>
                </div>
                
                <div className="preview-section">
                  <h4>Customer Information</h4>
                  <div className="preview-row"><span>Name:</span><span>{formData.customerName}</span></div>
                  {formData.email && <div className="preview-row"><span>Email:</span><span>{formData.email}</span></div>}
                  <div className="preview-row"><span>Address:</span><span>{formData.address}</span></div>
                  <div className="preview-row"><span>Within Coimbatore:</span><span>{formData.coimbatore}</span></div>
                </div>
                
                <div className="preview-section">
                  <h4>Service Details</h4>
                  <div className="preview-row"><span>Frame Size:</span><span>{formData.frameSize}</span></div>
                  <div className="preview-row"><span>Frame Type:</span><span>{formData.frameType}</span></div>
                  <div className="preview-row"><span>Quantity:</span><span>{formData.quantity}</span></div>
                  <div className="preview-row"><span>Unit Price:</span><span>₹{formData.frameAmount}</span></div>
                  <div className="preview-row"><span>Courier Required:</span><span>{formData.courier}</span></div>
                </div>
                
                <div className="preview-total">
                  <div className="preview-row"><span>Subtotal:</span><span>₹{subtotal}</span></div>
                  <div className="preview-row"><span>Courier Charges:</span><span>₹{courierCharge}</span></div>
                  <div className="preview-row" style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2563eb' }}>
                    <span>Grand Total:</span><span>₹{grandTotal}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPreview(false)} className="btn-secondary">Close</button>
              <button onClick={generatePDF} className="btn-primary" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;