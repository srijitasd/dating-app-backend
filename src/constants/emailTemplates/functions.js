exports.welcome_body = (body) => {
  return `<h1>Dear ${body.name},</h1> 
            </br>
            <h2>
                Welcome to Dating App! 
            </h2> </br>
            <p>
                We're thrilled to have you join our community who are on the quest for meaningful connections and exciting encounters. Whether you're here to find your soulmate, make new friends, or simply explore what's out there, we're here to support you every step of the way.
            </p.
            <p>
                If you ever have any questions, concerns, or feedback, our support team is here to help. Simply reach out to us through the app, and we'll be more than happy to assist you. </br>
                Once again, welcome to Dating App! We're thrilled to have you on board and can't wait to see where this journey takes you. </br> </br> 
                <b>Happy matching!</b>
            </p>`;
};

exports.signin_otp = (body) => {
  return `<h1>Hi ${body.name}</h1> 
    </br>
    <h2>
        Your One-Time Password (OTP) is: <b>${body.otp}</b> 
    </h2> </br>
    <p>
        Please use this code to complete your registration/login process.
    </p>`;
};
