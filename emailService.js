const mailer = require('./ne')


class EmailService {
    sendVerificationCode ({user, code}) {
        const mailOptions = {
            to: user.email,
            subject: 'Підтвердіть реестрацію',
            html: `
        <p>Привіт ${user.login}!</p>
        <p>Ваша пошта була вказана при реєстрації на сайті GameLand.</p>
        <p>Ваш код підтвердження: <strong>${code}</strong></p>
    `,
        };
        mailer(mailOptions);
    }

    sendWelcomeEmail ({user}) {
        const mailOptions = {
            to: user.email,
            subject: 'Ласкаво просимо до нашого проекту!',
            html: `
        <p>Привіт ${user.login}!</p>
        <p>Ви успішно зареєструвалися на сайті GameLand.</p>
        `
        };
        mailer(mailOptions)
    };

    sendPaymentDetails ({user, orderId, totalAmount}) {
        console.log("send paymant detail")
        console.log(user)
        console.log(orderId)
        console.log(totalAmount)
        const mailOptions = {
            to: user.email,
            subject: 'Реквізити для оплати!',
            html: `
        <p>Привіт ${user.login}!</p> 
        <p>Ви оформили замовлення номер "${orderId.toString().padStart(4, '0')}" на суму "${totalAmount} гривень".</p>
        <p>Оплатіть замовлення за реквізитами ${process.env.PAYMENT_DETAILS}.</p>
        `
        };
        mailer(mailOptions)
    };

    sendGameKey ({user, orderId, gameKeys}) {
        const mailOptions = {
            to: user.email,
            subject: 'Вітаю вас із покупкою.',
            html: `
        <p>Привіт ${user.login}!</p>
        <p>Ви оплатили ваше замовлення номер ${orderId}.</p>
        <p>Ми надсилаємо вам відповідні ключі.</p>
        ${gameKeys.map(item => `<p>Назва: "${item.title}", ключ: "${item.key}"</p>`).join('')}
        `
        };
        mailer(mailOptions)
    };
}

module.exports = new EmailService()
