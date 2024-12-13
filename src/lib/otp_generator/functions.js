exports.generate_otp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); // Convert to string to ensure it's exactly 6 digits
};
