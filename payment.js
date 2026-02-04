function payWithPaystack(e) {
    e.preventDefault();

    const email = document.getElementById('from_email').value;
    const amount = document.getElementById('amount').value;
    const name = document.getElementById('from_name').value;
    const phone = document.getElementById('from_contact').value;

    if (!email || !amount || !name || !phone) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: 'Please fill in all fields (Name, Email, Phone, and Amount).',
            confirmButtonColor: '#0047AB'
        });
        return;
    }

    const handler = PaystackPop.setup({
        key: 'pk_test_631116fb49a51d1f073de0309b6fabecf5520e93', // Replace with your public key
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo
        currency: 'GHS', // Ghana Cedis
        ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Generate a random reference number
        metadata: {
            custom_fields: [
                {
                    display_name: "Mobile Number",
                    variable_name: "mobile_number",
                    value: phone
                },
                {
                    display_name: "Payer Name",
                    variable_name: "payer_name",
                    value: name
                }
            ]
        },
        callback: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Payment Successful!',
                text: 'Thank you for your generous donation. Reference: ' + response.reference,
                confirmButtonColor: '#0047AB'
            });
            // Optional: You can send an email receipt here using EmailJS if desired
            document.getElementById('actionForm').reset();
            document.getElementById('actionModal').style.display = 'none';
        },
        onClose: function () {
            Swal.fire({
                icon: 'info',
                title: 'Transaction Cancelled',
                text: 'You chose to close the payment window.',
                confirmButtonColor: '#0047AB'
            });
        }
    });

    handler.openIframe();
}
