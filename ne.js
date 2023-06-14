const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(
    {
        host: process.env.NE_HOST,
        port: process.env.NE_PORT,
        secure: process.env.NE_SECURE,
        service: process.env.NE_SERVICE,
        auth: {
            user: process.env.NE_USER,
            pass: process.env.NE_PASS
        }
    },
    {
        from: process.env.NE_USER
    }
);

const mailer = mailOptions => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("\n\n",error)
            return
        }
        console.log('\n\nEmail sent: ', info)
    })
}

module.exports = mailer
