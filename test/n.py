import qrcode

# The text to encode
text = """I can build perfect systems,
make machines obey my will,
but without you here beside me,
my whole world stands still.

What good are all these victories,
the puzzles that I solve,
when the one thing that truly matters
is the love I can't program?"""

# Create QR Code object
qr = qrcode.QRCode(
    version=1,  # Controls size of the QR code (1-40). Use higher for more data
    error_correction=qrcode.constants.ERROR_CORRECT_Q,
    box_size=10,
    border=4,
)

# Add text to QR code
qr.add_data(text)
qr.make(fit=True)

# Create image
img = qr.make_image(fill_color="black", back_color="white")

# Save to file
img.save("poem_qr.png")

print("QR code saved as 'poem_qr.png'")
