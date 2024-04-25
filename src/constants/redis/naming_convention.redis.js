exports.session_store = (id) => {
  return `session:${id}`;
};

exports.signin_otp_store = (id) => {
  return `signin:otp:${id}`;
};

exports.potential_matches_store = (id) => {
  return `potential:match:${id}`;
};

exports.swipe_limit_store = (id) => {
  return `swipe:limit:${id}`;
};
