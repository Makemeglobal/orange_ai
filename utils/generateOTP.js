const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 900).toString();
  };
  
  module.exports = generateOTP;
  