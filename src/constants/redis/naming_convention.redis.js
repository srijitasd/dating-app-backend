exports.session_store = (id) => {
  return `session:${id}`;
};

exports.signin_otp_store = (id) => {
  return `signin:otp:${id}`;
};
