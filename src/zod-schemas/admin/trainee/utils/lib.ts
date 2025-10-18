// Function to generate random username
export const generateRandomUsername = () => {
  const adjectives = [
    "swift",
    "clever",
    "brave",
    "calm",
    "eager",
    "gentle",
    "happy",
    "keen",
  ];
  const nouns = [
    "tiger",
    "eagle",
    "wolf",
    "lion",
    "bear",
    "hawk",
    "fox",
    "deer",
  ];
  const randomNum = Math.floor(Math.random() * 1000);
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}_${noun}_${randomNum}`;
};

// Function to generate random password
export const generateRandomPassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
