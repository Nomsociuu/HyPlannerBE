// services/mixpanelServer.js
const Mixpanel = require("mixpanel");

const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN, {
  protocol: "https",
});

// Export module đã khởi tạo
module.exports = mixpanel;
