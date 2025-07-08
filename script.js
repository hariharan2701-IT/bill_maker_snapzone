window.onload = () => {
  const { jsPDF } = window.jspdf;

  window.generatePDF = function () {
    const orderNumber = document.getElementById("orderNumber").value;
    const customerName = document.getElementById("customerName").value;
    const phone = document.getElementById("phone").value;
    const coimbatore = document.getElementById("coimbatore").value;
    const courier = document.getElementById("courier").value;
    const frameSize = document.getElementById("frameSize").value;
    const frameAmount = parseInt(document.getElementById("frameAmount").value);
    const location = document.getElementById("location").value;

    const courierCharge = courier === "Yes" ? 70 : 0;
    const grandTotal = frameAmount + courierCharge;

    const doc = new jsPDF();

    const logo = 'data:image/png;base64,REPLACE_WITH_YOUR_LOGO_BASE64'; // Replace with real logo
    doc.addImage(logo, 'PNG', 70, 10, 70, 70);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);

    let y = 90;
    const lines = [
      `Order Number: ${orderNumber}`,
      `Customer Name: ${customerName}`,
      `Phone Number: ${phone}`,
      `Within Coimbatore: ${coimbatore}`,
      `Courier Required: ${courier}`,
      `Frame Size: ${frameSize}`,
      `Frame Amount: ₹${frameAmount}`,
      `Location: ${location}`,
      `Courier Charge: ${courier === 'Yes' ? '₹70' : 'No'}`,
      `Grand Total: ₹${grandTotal}`
    ];

    lines.forEach((line, i) => doc.text(line, 20, y + i * 10));

    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for shopping at Snapzone Frames!", 20, y + lines.length * 10 + 20);
    doc.text("Keep shopping.", 20, y + lines.length * 10 + 30);
    doc.text("Contact: +91 77085 54879 / +91 94836 92989", 20, y + lines.length * 10 + 45);

    doc.save(`${customerName.toLowerCase()}'s order.pdf`);
  }
};
