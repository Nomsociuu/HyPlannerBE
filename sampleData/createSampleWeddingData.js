const createSampleWeddingData = (creatorId, weddingDate) => {
  // 1. Dữ liệu mẫu cho Activities
  // Trang sức & Nhẫn cưới
  const jewelryActivities = [
    {
      activityName: "Nhẫn đính hôn",
      activityNote: "Mua nhẫn đính hôn",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Nhẫn cưới",
      activityNote: "Mua nhẫn cưới",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang sức cô dâu",
      activityNote:
        "Mua trang sức cho cô dâu (dây chuyền, vòng tay, bông tai, kiềng cưới)",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Quà cưới bố mẹ hai bên",
      activityNote: "Mua quà cưới tặng bố mẹ hai bên (nếu có)",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
  ];
  // Ảnh và video
  const photoVideoActivities = [
    {
      activityName: "Chụp ảnh pre-wedding",
      activityNote: "Chụp ảnh pre-wedding tại studio / ngoại cảnh / du lịch",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Album, photobook, ảnh phóng to để bàn",
      activityNote: "Thiết kế và in ấn album, photobook, ảnh phóng to để bàn",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Quay – chụp lễ ăn hỏi",
      activityNote: "Quay phim lễ ăn hỏi và chụp ảnh",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Quay – chụp lễ cưới",
      activityNote:
        "Quay phim lễ cưới và chụp ảnh (full ngày, highlight, clip phóng sự)",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Flycam (nếu cần)",
      activityNote: "Thuê flycam để quay phim từ trên cao (nếu cần)",
      expectedBudget: 0,
      actualBudget: 0,
      payer: "both",
    },
  ];
  // Trang phục – Make up
  const costumeActivities = [
    {
      activityName: "Váy cưới (làm lễ, đi tiệc, dạ hội)",
      activityNote: "Thuê hoặc mua váy cưới cho các buổi lễ khác nhau",
      expectedBudget: 8000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Vest cưới (1–2 bộ, vest phụ rể)",
      activityNote: "Thuê vest cưới cho chú rể và phụ rể",
      expectedBudget: 4000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Áo dài / trang phục truyền thống",
      activityNote: "Thuê áo dài cho lễ ăn hỏi và đón dâu",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang phục phụ dâu – phụ rể",
      activityNote: "Thuê trang phục cho phụ dâu và phụ rể",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang phục bố mẹ hai bên",
      activityNote: "Mua hoặc thuê trang phục lịch sự cho bố mẹ",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Make up & làm tóc cô dâu",
      activityNote: "Trang điểm và làm tóc cho ăn hỏi và ngày cưới",
      expectedBudget: 2500000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Make up người nhà",
      activityNote: "Trang điểm cho mẹ, chị em, phụ dâu",
      expectedBudget: 1500000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Giày cưới, phụ kiện tóc, khăn voan",
      activityNote: "Thuê/đặt giày cưới và các phụ kiện cần thiết",
      expectedBudget: 1000000,
      actualBudget: 0,
      payer: "both",
    },
  ];

  // Lễ ăn hỏi / Đám ngõ
  const engagementActivities = [
    {
      activityName: "Lễ vật ăn hỏi",
      activityNote:
        "Trầu cau, chè, rượu, bánh, hoa quả, lợn quay/gà trống, xôi, mâm quả",
      expectedBudget: 5000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Lễ đen",
      activityNote: "Tiền mặt trong lễ ăn hỏi",
      expectedBudget: 20000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Đội bưng quả",
      activityNote: "Thuê đội bưng quả với trang phục và lì xì",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Xe đưa đón họ hàng (ăn hỏi)",
      activityNote: "Thuê xe đưa đón họ hàng đi ăn hỏi",
      expectedBudget: 1500000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Tiệc chiêu đãi ăn hỏi",
      activityNote: "Tiệc chiêu đãi tại nhà hoặc nhà hàng",
      expectedBudget: 8000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang trí lễ ăn hỏi",
      activityNote: "Phông, cổng hoa, bàn ghế, backdrop, hoa tươi",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
  ];

  // Lễ cưới (sửa lại ceremony activities)
  const ceremonyActivities = [
    {
      activityName: "Hoa cưới",
      activityNote: "Hoa cầm tay, hoa cài áo, hoa xe cưới, hoa bàn tiệc",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Xe hoa/ xe đưa dâu",
      activityNote: "Thuê xe hoa đưa dâu và trang trí",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang trí nhà gái",
      activityNote: "Phòng tân hôn, bàn thờ gia tiên, cổng hoa",
      expectedBudget: 4000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang trí nhà trai",
      activityNote: "Cổng hoa, bàn tiệc, phông cưới",
      expectedBudget: 4000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "MC – ban nhạc – ca sĩ",
      activityNote: "Thuê MC và ban nhạc riêng cho lễ cưới",
      expectedBudget: 5000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Đội bê tráp",
      activityNote: "Lì xì và phục trang cho đội bê tráp",
      expectedBudget: 1500000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Nghi lễ gia tiên, lễ rước dâu",
      activityNote: "Tráp, mâm lễ, sính lễ cho các nghi lễ",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
  ];

  // Tiệc cưới (sửa lại party activities)
  const partyActivities = [
    {
      activityName: "Đặt tiệc cưới",
      activityNote: "Đặt tiệc cưới tại nhà hàng theo bàn",
      expectedBudget: 30000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Đồ uống tiệc cưới",
      activityNote: "Bia, nước ngọt, rượu vang, nước lọc",
      expectedBudget: 5000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Bánh cưới",
      activityNote: "Đặt bánh cưới cho tiệc",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "MC & ban nhạc tiệc cưới",
      activityNote: "MC và ban nhạc cho tiệc cưới (nếu nằm trong gói)",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Sân khấu, âm thanh, ánh sáng",
      activityNote: "Thiết bị sân khấu và âm thanh ánh sáng",
      expectedBudget: 4000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Trang trí tiệc cưới",
      activityNote: "Backdrop chụp ảnh, hoa tươi bàn tiệc, photo booth",
      expectedBudget: 6000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Quà tặng khách mời",
      activityNote: "Thank you gift, kẹo/khăn/ly kỷ niệm",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Nhân viên phục vụ, phí phát sinh",
      activityNote: "Chi phí nhân viên và các phí phát sinh khác",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
  ];

  // Hậu cần & Khác
  const logisticsActivities = [
    {
      activityName: "Thiệp cưới",
      activityNote: "In và giao thiệp cưới tận tay",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Bao lì xì",
      activityNote: "Lì xì cho người hỗ trợ, nhóm bạn, trẻ con",
      expectedBudget: 3000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Phòng nghỉ khách sạn",
      activityNote: "Phòng cho cô dâu chú rể hoặc khách từ xa",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Chi phí di chuyển",
      activityNote: "Taxi, xe đưa đón họ hàng",
      expectedBudget: 1500000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Phí dịch vụ cưới trọn gói",
      activityNote: "Wedding planner, wedding organizer",
      expectedBudget: 10000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Tiền tip cho ekip",
      activityNote: "Tip cho nhiếp ảnh, trang điểm, âm thanh ánh sáng",
      expectedBudget: 2000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Chi phí in ấn khác",
      activityNote: "Standee, banner, menu",
      expectedBudget: 1000000,
      actualBudget: 0,
      payer: "both",
    },
  ];

  // Dự phòng & Sau cưới
  const afterWeddingActivities = [
    {
      activityName: "Tuần trăng mật",
      activityNote: "Vé máy bay, khách sạn, chi phí ăn chơi",
      expectedBudget: 20000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Cảm ơn ekip, bạn bè",
      activityNote: "Mua quà, gửi thiệp cảm ơn",
      expectedBudget: 1500000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "In album kỷ niệm cho bố mẹ",
      activityNote: "In album cưới tặng bố mẹ hai bên",
      expectedBudget: 1000000,
      actualBudget: 0,
      payer: "both",
    },
    {
      activityName: "Phát sinh ngoài kế hoạch",
      activityNote: "Dự phòng 10-15% tổng ngân sách",
      expectedBudget: 15000000,
      actualBudget: 0,
      payer: "both",
    },
  ];

  // 2. Dữ liệu mẫu cho GroupActivities
  const groupActivitiesData = [
    {
      groupName: "Trang sức & Nhẫn cưới",
      activities: [],
    },
    {
      groupName: "Ảnh và video",
      activities: [],
    },
    {
      groupName: "Trang phục – Make up",
      activities: [],
    },
    {
      groupName: "Lễ ăn hỏi / Đám ngõ",
      activities: [],
    },
    {
      groupName: "Lễ cưới",
      activities: [],
    },
    {
      groupName: "Chụp ảnh & Quay phim",
      activities: [],
    },
    {
      groupName: "Tiệc cưới",
      activities: [],
    },
    {
      groupName: "Hậu cần & Khác",
      activities: [],
    },
    {
      groupName: "Dự phòng & Sau cưới",
      activities: [],
    },
  ];

  // 3. Dữ liệu mẫu cho Tasks theo từng giai đoạn
  const phase1Tasks = [
    {
      taskName: "Hai bên gia đình bàn bạc ngày ăn hỏi, ngày cưới",
      taskNote: "Thống nhất ngày ăn hỏi và ngày cưới giữa hai gia đình",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Xây dựng ngân sách dự kiến",
      taskNote: "Lập ngân sách chi tiết cho toàn bộ đám cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Lập danh sách khách mời lần đầu",
      taskNote: "Dự kiến số lượng khách mời từ hai bên gia đình",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Tìm hiểu phong cách, xu hướng tổ chức hôn lễ",
      taskNote: "Nghiên cứu các ý tưởng và xu hướng tổ chức đám cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Khảo sát địa điểm tổ chức tiệc cưới",
      taskNote: "So sánh các địa điểm tổ chức tiệc cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Tìm hiểu các nhà cung cấp dịch vụ cưới",
      taskNote: "Liên hệ sơ bộ với các nhà cung cấp dịch vụ",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Lên phương án chỗ ở sau hôn lễ",
      taskNote: "Quyết định nơi ở cho vợ chồng sau cưới",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase2Tasks = [
    {
      taskName: "Chốt địa điểm tổ chức tiệc cưới",
      taskNote: "Đặt giữ chỗ địa điểm tổ chức tiệc cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Lựa chọn chủ đề/ý tưởng cưới",
      taskNote: "Chọn phong cách, tông màu, cách trang trí",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt dịch vụ trang trí",
      taskNote:
        "Liên hệ và đặt dịch vụ trang trí cho ăn hỏi, lễ gia tiên, tiệc cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt dịch vụ chụp ảnh, quay phim",
      taskNote: "Thuê nhiếp ảnh gia và quay phim cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt thiệp cưới, hoa cưới, xe đưa đón",
      taskNote: "Liên hệ đặt thiệp cưới, hoa cưới và xe đưa đón",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Lập kế hoạch tuần trăng mật",
      taskNote: "Chọn địa điểm, đặt vé, khách sạn cho tuần trăng mật",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Kiểm tra sức khỏe tiền hôn nhân",
      taskNote: "Đi khám sức khỏe tiền hôn nhân cho cả hai",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Thử trang phục cưới",
      taskNote: "Bắt đầu đi thử trang phục cưới, lễ phục ăn hỏi",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chuẩn bị quỹ dự phòng",
      taskNote: "Chuẩn bị tiền dự phòng phát sinh, kiểm tra thủ tục giấy tờ",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase3Tasks = [
    {
      taskName: "Chuẩn bị lễ ăn hỏi",
      taskNote: "Chuẩn bị lễ vật, nghi thức, dàn bưng quả, đặt cỗ, thuê xe",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chọn trang phục ăn hỏi",
      taskNote: "Chọn trang phục cho cô dâu chú rể và người thân",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt lịch make up, nail và làm tóc thử",
      taskNote: "Đặt lịch làm đẹp cho ngày ăn hỏi và ngày cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Quyết định may hoặc thuê váy cưới",
      taskNote: "Chọn may hoặc thuê váy cưới, áo dài, suit",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Thực hiện chụp hình Pre-wedding",
      taskNote: "Chụp ảnh cưới trước đám cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Mua nhẫn cưới",
      taskNote: "Chọn và mua nhẫn cưới cho cả hai",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Rà soát danh sách khách mời lần 2",
      taskNote: "Tinh gọn và hoàn thiện danh sách khách mời",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Xây dựng kịch bản chương trình tiệc",
      taskNote: "Lập timeline và kịch bản cho tiệc cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt ban nhạc, ca sĩ",
      taskNote: "Thuê ban nhạc và ca sĩ cho đám cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Mua sắm đồ đạc cho tổ ấm mới",
      taskNote: "Chuẩn bị đồ dùng cho phòng tân hôn và nhà mới",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase4Tasks = [
    {
      taskName: "Chuẩn bị phụ kiện cho cô dâu – chú rể",
      taskNote: "Mua sắm phụ kiện cần thiết cho ngày cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chốt mẫu thiệp và in",
      taskNote: "Hoàn thiện thiết kế và tiến hành in thiệp cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Tập luyện First Dance",
      taskNote: "Luyện tập điệu nhảy đầu tiên hoặc các tiết mục riêng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn tất album ảnh Pre-wedding",
      taskNote: "Hoàn thiện album ảnh và video Pre-wedding",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chọn menu và thử món ăn",
      taskNote: "Chọn menu và thử món ăn của tiệc cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chốt số lượng bàn tiệc",
      taskNote: "Xác định số lượng bàn tiệc cuối cùng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn tất hợp đồng ban nhạc, ca sĩ",
      taskNote: "Ký kết hợp đồng chính thức với ban nhạc và ca sĩ",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt quà lưu niệm cho khách mời",
      taskNote: "Lựa chọn và đặt quà lưu niệm cho khách mời",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase5Tasks = [
    {
      taskName: "Tìm phù dâu, phù rể",
      taskNote: "Nhờ bạn bè hoặc người thân làm phù dâu, phù rể",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Soạn playlist nhạc cho hôn lễ",
      taskNote: "Chuẩn bị danh sách nhạc cho các phần trong đám cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn thiện timeline chi tiết ngày cưới",
      taskNote: "Lập timeline chi tiết cho toàn bộ ngày cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Thống nhất nội dung với MC",
      taskNote: "Làm việc với MC để thống nhất chương trình",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn tất thủ tục đăng ký kết hôn",
      taskNote: "Hoàn thành các thủ tục pháp lý đăng ký kết hôn",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đặt phương tiện di chuyển",
      taskNote: "Thuê xe đưa đón cho gia đình, bạn bè",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chọn trang phục ngày cưới cho gia đình",
      taskNote: "Chuẩn bị trang phục cho các thành viên gia đình",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chốt trang phục cho phù dâu, phù rể",
      taskNote: "Hoàn thiện trang phục cho đội phù dâu, phù rể",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase6Tasks = [
    {
      taskName: "Viết và gửi thiệp mời",
      taskNote: "Hoàn thiện và phát thiệp mời cho khách",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn thiện trang phục cô dâu, chú rể",
      taskNote: "Kiểm tra và hoàn thiện toàn bộ trang phục",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chuẩn bị trang phục cho gia đình và phụ dâu",
      taskNote: "Chuẩn bị trang phục cho gia đình và dàn phụ dâu, phụ rể",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Viết bài phát biểu, lời chúc",
      taskNote: "Nhờ người thân viết bài phát biểu và lời chúc",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Gửi timeline cho gia đình và phụ dâu",
      taskNote: "Chia sẻ chương trình chi tiết với mọi người",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Sắp xếp sơ đồ chỗ ngồi",
      taskNote: "Lập sơ đồ chỗ ngồi cho khách mời",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Phân công quản lý thùng tiền mừng",
      taskNote: "Chỉ định người phụ trách thu tiền mừng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chuẩn bị đồ dùng cho cô dâu",
      taskNote: "Nhờ em/chị xách vali hoặc đồ dùng cho cô dâu",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Kiểm tra flow chương trình",
      taskNote: "Kiểm tra lại luồng chương trình với người hỗ trợ",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chuẩn bị quà cho khách đặc biệt",
      taskNote:
        "Chuẩn bị quà hoặc lời cảm ơn riêng cho bố mẹ, họ hàng thân thiết",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase7Tasks = [
    {
      taskName: "Viết vows (lời thề hôn nhân)",
      taskNote: "Chuẩn bị lời thề hôn nhân cho ngày cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Kiểm tra ấn phẩm cưới",
      taskNote: "Kiểm tra thiệp, bảng tên, menu và các ấn phẩm khác",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Liên hệ nhắc lại với nhà cung cấp",
      taskNote: "Xác nhận lại với tất cả nhà cung cấp dịch vụ",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Làm tóc và chăm sóc da, móng",
      taskNote: "Chăm sóc sắc đẹp trước ngày cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chuẩn bị túi vật dụng khẩn cấp",
      taskNote:
        "Chuẩn bị kem chống nắng, xịt khoáng, nước hoa, chỉ kim, băng keo",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase8Tasks = [
    {
      taskName: "Nhận trang phục chính thức",
      taskNote: "Nhận và kiểm tra trang phục cuối cùng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Kiểm tra lần cuối toàn bộ hạng mục",
      taskNote: "Kiểm tra checklist toàn bộ công việc cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Soát checklist đồ cần mang theo",
      taskNote: "Kiểm tra danh sách đồ dùng cần thiết",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Luyện tập vows",
      taskNote: "Tập đọc lời thề hôn nhân",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Nghỉ ngơi, spa, chăm sóc sức khỏe",
      taskNote: "Cô dâu – chú rể nghỉ ngơi và chăm sóc sức khỏe",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase9Tasks = [
    {
      taskName: "Ăn uống lành mạnh, uống nhiều nước",
      taskNote: "Duy trì chế độ dinh dưỡng tốt",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Soạn sẵn vali/túi đồ dùng",
      taskNote: "Chuẩn bị đồ dùng cho ngày mai",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Treo sẵn trang phục",
      taskNote: "Chuẩn bị trang phục sẵn sàng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Dưỡng da đầy đủ",
      taskNote: "Chăm sóc da tối ưu trước ngày cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Đi ngủ sớm",
      taskNote: "Nghỉ ngơi đầy đủ để giữ sức khỏe",
      member: [creatorId],
      completed: false,
    },
  ];

  const phase10Tasks = [
    {
      taskName: "Ăn sáng no và đủ chất",
      taskNote: "Ăn sáng đầy đủ dinh dưỡng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Uống đủ nước để giữ sức",
      taskNote: "Duy trì đủ nước trong cơ thể",
      member: [creatorId],
      completed: false,
    },
  ];

  const afterWeddingTasks = [
    {
      taskName: "Liên hệ ekip nhận ảnh, video",
      taskNote: "Nhận ảnh và video chính thức từ ekip",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chọn lọc ảnh in album",
      taskNote: "Chọn ảnh để in album, làm photobook hoặc khung ảnh",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Lưu trữ file ảnh, video",
      taskNote: "Lưu file ra nhiều nơi để tránh mất dữ liệu",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chia sẻ album online",
      taskNote: "Chia sẻ album online cho khách mời",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Tổng kết chi phí cưới",
      taskNote: "Đối chiếu thu – chi với ngân sách ban đầu",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Cảm ơn và trả thù lao ekip",
      taskNote: "Cảm ơn MC, ban nhạc, ekip, bạn bè đã hỗ trợ",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Gửi lời cảm ơn khách mời",
      taskNote: "Sắp xếp và gửi lời cảm ơn đến khách đã mừng",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Trả váy cưới, suit, phụ kiện thuê",
      taskNote: "Gửi trả các trang phục và phụ kiện đã thuê",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Bảo quản váy cưới, vest giữ lại",
      taskNote: "Bảo quản trang phục cưới nếu muốn giữ lại",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Kiểm kê đồ dùng lễ cưới còn dư",
      taskNote: "Kiểm tra thiệp, quà khách, phụ kiện decor còn lại",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Tặng quà cảm ơn riêng",
      taskNote: "Tặng quà cho bố mẹ, họ hàng thân thiết, bạn bè đã giúp đỡ",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn tất thủ tục đăng ký kết hôn",
      taskNote: "Hoàn thành các thủ tục còn lại liên quan đến kết hôn",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Cập nhật thông tin hôn nhân",
      taskNote: "Cập nhật trên hộ khẩu, ngân hàng, bảo hiểm",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Sắp xếp, dọn dẹp đồ dùng sau cưới",
      taskNote: "Tổ chức lại đồ đạc sau đám cưới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Hoàn thiện phòng tân hôn",
      taskNote: "Hoàn thiện việc trang trí phòng tân hôn hoặc nhà mới",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Tạo thói quen sinh hoạt chung",
      taskNote: "Thiết lập thói quen sinh hoạt và chi tiêu chung",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Nghỉ ngơi, du lịch tuần trăng mật",
      taskNote: "Dành thời gian nghỉ ngơi hoặc đi tuần trăng mật",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Chia sẻ, nhìn lại ngày trọng đại",
      taskNote: "Dành thời gian riêng để chia sẻ và nhìn lại",
      member: [creatorId],
      completed: false,
    },
    {
      taskName: "Lên kế hoạch tài chính, mục tiêu chung",
      taskNote: "Lập kế hoạch mua nhà, con cái, tiết kiệm",
      member: [creatorId],
      completed: false,
    },
  ];

  // 4. Dữ liệu mẫu cho Phases (tính từ ngày tạo event + thời gian cần thiết)
  const currentDate = new Date(); // Ngày tạo wedding event trên app

  // Giai đoạn 1: 4 tháng (120 ngày)
  const phase1StartDate = currentDate;
  const phase1EndDate = new Date(
    currentDate.getTime() + 120 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 2: 5 tháng (150 ngày) - bắt đầu từ khi kết thúc giai đoạn 1
  const phase2StartDate = new Date(
    phase1EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase2EndDate = new Date(
    phase2StartDate.getTime() + 150 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 3: 6 tháng (180 ngày)
  const phase3StartDate = new Date(
    phase2EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase3EndDate = new Date(
    phase3StartDate.getTime() + 180 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 4: 3 tháng (90 ngày)
  const phase4StartDate = new Date(
    phase3EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase4EndDate = new Date(
    phase4StartDate.getTime() + 90 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 5: 2 tháng (60 ngày)
  const phase5StartDate = new Date(
    phase4EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase5EndDate = new Date(
    phase5StartDate.getTime() + 60 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 6: 1 tháng (30 ngày)
  const phase6StartDate = new Date(
    phase5EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase6EndDate = new Date(
    phase6StartDate.getTime() + 30 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 7: 2 tuần (14 ngày)
  const phase7StartDate = new Date(
    phase6EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase7EndDate = new Date(
    phase7StartDate.getTime() + 14 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 8: 1 tuần (7 ngày)
  const phase8StartDate = new Date(
    phase7EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase8EndDate = new Date(
    phase8StartDate.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 9: 1 ngày trước
  const phase9StartDate = new Date(
    phase8EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase9EndDate = new Date(
    phase9StartDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );

  // Giai đoạn 10: Ngày cưới (1 ngày)
  const phase10StartDate = new Date(
    phase9EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const phase10EndDate = new Date(
    phase10StartDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );

  // Hậu cưới: 8 tháng (240 ngày)
  const afterWeddingStartDate = new Date(
    phase10EndDate.getTime() + 1 * 24 * 60 * 60 * 1000
  );
  const afterWeddingEndDate = new Date(
    afterWeddingStartDate.getTime() + 240 * 24 * 60 * 60 * 1000
  );

  const phasesData = [
    {
      phaseTimeStart: phase1StartDate,
      phaseTimeEnd: phase1EndDate,
      tasks: [], // Sẽ được gán phase1Tasks
    },
    {
      phaseTimeStart: phase2StartDate,
      phaseTimeEnd: phase2EndDate,
      tasks: [], // Sẽ được gán phase2Tasks
    },
    {
      phaseTimeStart: phase3StartDate,
      phaseTimeEnd: phase3EndDate,
      tasks: [], // Sẽ được gán phase3Tasks
    },
    {
      phaseTimeStart: phase4StartDate,
      phaseTimeEnd: phase4EndDate,
      tasks: [], // Sẽ được gán phase4Tasks
    },
    {
      phaseTimeStart: phase5StartDate,
      phaseTimeEnd: phase5EndDate,
      tasks: [], // Sẽ được gán phase5Tasks
    },
    {
      phaseTimeStart: phase6StartDate,
      phaseTimeEnd: phase6EndDate,
      tasks: [], // Sẽ được gán phase6Tasks
    },
    {
      phaseTimeStart: phase7StartDate,
      phaseTimeEnd: phase7EndDate,
      tasks: [], // Sẽ được gán phase7Tasks
    },
    {
      phaseTimeStart: phase8StartDate,
      phaseTimeEnd: phase8EndDate,
      tasks: [], // Sẽ được gán phase8Tasks
    },
    {
      phaseTimeStart: phase9StartDate,
      phaseTimeEnd: phase9EndDate,
      tasks: [], // Sẽ được gán phase9Tasks
    },
    {
      phaseTimeStart: phase10StartDate,
      phaseTimeEnd: phase10EndDate,
      tasks: [], // Sẽ được gán phase10Tasks
    },
    {
      phaseTimeStart: afterWeddingStartDate,
      phaseTimeEnd: afterWeddingEndDate,
      tasks: [], // Sẽ được gán afterWeddingTasks
    },
  ];

  return {
    activities: {
      jewelry: jewelryActivities,
      photoVideo: photoVideoActivities,
      costume: costumeActivities,
      engagement: engagementActivities,
      ceremony: ceremonyActivities,
      party: partyActivities,
      logistics: logisticsActivities,
      afterWedding: afterWeddingActivities,
    },
    groupActivities: groupActivitiesData,
    tasks: {
      phase1: phase1Tasks,
      phase2: phase2Tasks,
      phase3: phase3Tasks,
      phase4: phase4Tasks,
      phase5: phase5Tasks,
      phase6: phase6Tasks,
      phase7: phase7Tasks,
      phase8: phase8Tasks,
      phase9: phase9Tasks,
      phase10: phase10Tasks,
      afterWedding: afterWeddingTasks,
    },
    phases: phasesData,
  };
};
module.exports = { createSampleWeddingData };
