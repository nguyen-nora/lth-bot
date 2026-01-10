/**
 * Vietnamese Translation Constants
 * Centralized translations for all user-facing messages
 */

export interface Translations {
  [key: string]: string | Translations | string[];
}

/**
 * Vietnamese translations organized by category
 */
export const translations: Translations = {
  // Common messages
  common: {
    serverOnly: 'Lệnh này chỉ có thể sử dụng trong máy chủ.',
    unknownError: 'Đã xảy ra lỗi không xác định.',
    tryAgainLater: 'Vui lòng thử lại sau.',
  },

  // Command descriptions
  commands: {
    ping: {
      description: 'Trả lời với Pong!',
      response: 'Pong! 🏓 (Độ trễ: {latency}ms)',
    },
    kethon: {
      description: 'Cầu hôn người dùng khác',
      optionUser: 'Người dùng bạn muốn cầu hôn',
      proposalSent: '💍 Đã gửi lời cầu hôn đến {user}! Họ sẽ nhận được tin nhắn riêng với lời cầu hôn.',
      cannotProposeToSelf: 'Bạn không thể cầu hôn chính mình!',
      cannotProposeToBot: 'Bạn không thể cầu hôn bot!',
      dmFailed: 'Không thể gửi tin nhắn riêng cầu hôn. Người dùng có thể đã tắt tin nhắn riêng.',
    },
    lyhon: {
      description: 'Ly hôn với đối tác hiện tại',
      marriageDissolved: 'Cuộc hôn nhân của bạn đã được giải thể.',
    },
    status: {
      description: 'Kiểm tra trạng thái người dùng và thông tin hôn nhân',
      optionUser: 'Người dùng cần kiểm tra trạng thái (mặc định là chính bạn)',
      userNotFound: 'Không tìm thấy người dùng hoặc người dùng không có trong máy chủ này.',
      fetchError: 'Đã xảy ra lỗi khi lấy thông tin trạng thái. Vui lòng thử lại sau.',
      invalidUser: 'Người dùng không hợp lệ.',
    },
    diemdanh: {
      description: 'Điểm danh tất cả người dùng trong kênh thoại',
      noUsersInVoice: 'Hiện không có người dùng nào trong kênh thoại.',
      attendanceRecorded: '✅ Đã ghi danh cho {count} người dùng trong kênh thoại.',
      permissionError: 'Bot không có quyền xem kênh thoại.',
      recordError: 'Đã xảy ra lỗi khi ghi danh. Vui lòng thử lại sau.',
    },
    checkdd: {
      description: 'Kiểm tra bản ghi điểm danh cho ngày cụ thể',
      optionDate: 'Ngày theo định dạng YYYY-MM-DD (mặc định là hôm nay)',
      noRecords: 'Không tìm thấy bản ghi điểm danh cho {date}.',
      invalidDateFormat: 'Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD (ví dụ: 2024-01-15).',
      futureDate: 'Không thể kiểm tra điểm danh cho ngày trong tương lai.',
      fetchError: 'Đã xảy ra lỗi khi lấy thông tin điểm danh. Vui lòng thử lại sau.',
      attendanceFor: '📅 Điểm danh cho {date}',
      usersPresent: 'Người dùng có mặt',
      total: 'Tổng',
      users: 'người dùng',
      user: 'người dùng',
      unknownChannel: 'Kênh không xác định',
      unknownUser: 'Người dùng không xác định',
    },
    help: {
      description: 'Hiển thị danh sách tất cả các lệnh có sẵn',
      title: '📚 Danh sách lệnh',
      descriptionText: 'Danh sách tất cả các lệnh có sẵn của bot:',
      adminCommands: 'Lệnh quản trị viên',
      userCommands: 'Lệnh người dùng',
      permissionRequired: 'Yêu cầu quyền quản trị viên',
      availableToAll: 'Có sẵn cho tất cả người dùng',
      footer: 'Sử dụng /help để xem lại danh sách này',
    },
  },

  // Error messages
  errors: {
    permissionDenied: 'Bạn không có quyền sử dụng lệnh này.',
    permissionCheckError: 'Đã xảy ra lỗi khi kiểm tra quyền. Vui lòng thử lại sau.',
    commandExecutionError: 'Đã xảy ra lỗi khi thực thi lệnh này!',
    invalidButtonInteraction: 'Tương tác nút không hợp lệ.',
    invalidProposalId: 'ID lời cầu hôn không hợp lệ.',
    buttonExpired: 'Nút này đã hết hạn.',
    notAuthorized: 'Bạn không được phép thực hiện hành động này.',
    proposalNotFound: 'Không tìm thấy lời cầu hôn.',
    proposalNotPending: 'Lời cầu hôn này không còn chờ xử lý.',
    proposalExpired: 'Lời cầu hôn này đã hết hạn. Vui lòng yêu cầu họ cầu hôn lại.',
    alreadyMarried: 'Bạn đã kết hôn! Sử dụng `/lyhon` trước.',
    userAlreadyMarried: 'Người dùng đó đã kết hôn với người khác.',
    proposalExists: 'Đã tồn tại lời cầu hôn giữa bạn và người dùng đó.',
    rateLimit: 'Bạn chỉ có thể cầu hôn một lần mỗi giờ. Vui lòng đợi thêm {minutes} phút trước khi cầu hôn lại.',
    notMarried: 'Bạn hiện không kết hôn.',
    notCurrentlyMarried: 'Bạn hiện không kết hôn.',
    clientNotSet: 'Discord client chưa được thiết lập.',
    notificationChannelNotFound: 'Không tìm thấy kênh thông báo.',
    failedToCreateMarriage: 'Không thể tạo cuộc hôn nhân: {error}',
    failedToFetchStatus: 'Không thể lấy trạng thái người dùng: {error}',
    failedToFormatEmbed: 'Không thể định dạng embed: {error}',
    failedToRecordAttendance: 'Không thể ghi danh: {error}',
    failedToFetchAttendance: 'Không thể lấy bản ghi điểm danh: {error}',
    failedToFetchStats: 'Không thể lấy thống kê điểm danh: {error}',
    invalidDateFormat: 'Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.',
    futureDate: 'Không thể kiểm tra điểm danh cho ngày trong tương lai.',
    // Profile/Image errors
    invalidImageFormat: 'Định dạng ảnh không hợp lệ. Vui lòng sử dụng {formats}.',
    imageTooLarge: 'Ảnh quá lớn. Kích thước tối đa là {maxSize}.',
    imageProcessingFailed: 'Không thể xử lý ảnh: {error}',
    imageSaveFailed: 'Không thể lưu ảnh: {error}',
    imageLoadFailed: 'Không thể tải ảnh: {error}',
    invalidStatus: 'Trạng thái không hợp lệ. Các giá trị hợp lệ: {validStatuses}',
    failedToGetProfile: 'Không thể lấy hồ sơ người dùng: {error}',
    failedToUpdateStatus: 'Không thể cập nhật trạng thái: {error}',
    failedToUpdateImage: 'Không thể cập nhật ảnh: {error}',
    failedToDeleteProfile: 'Không thể xóa hồ sơ: {error}',
    // Certificate errors
    failedToGetCertificate: 'Không thể lấy giấy kết hôn: {error}',
    marriageNotFound: 'Không tìm thấy cuộc hôn nhân.',
    messageTooLong: 'Lời nhắn quá dài. Tối đa {maxLength} ký tự.',
  },

  // Marriage-related messages
  marriage: {
    proposal: {
      sent: '💍 Đã gửi lời cầu hôn',
      sentDescription: 'Bạn đã cầu hôn {user}. Đang chờ phản hồi của họ...',
      title: '💍 Lời cầu hôn',
      description: '{proposer} muốn kết hôn với bạn!',
      server: 'Máy chủ',
      expiresIn: 'Lời cầu hôn này hết hạn sau 15 phút',
    },
    announcement: {
      title: '💍 Thông báo kết hôn',
      description: '{user1} và {user2} đã kết hôn! 🎉',
    },
    confirmation: {
      message: '🎉 Chúc mừng! Bạn đã kết hôn với {partner}!',
    },
    rejection: {
      message: 'Lời cầu hôn đã bị từ chối.',
    },
    divorce: {
      message: 'Cuộc hôn nhân của bạn đã được giải thể.',
    },
    buttons: {
      accept: 'Chấp nhận',
      decline: 'Từ chối',
    },
    buttonResponse: {
      accepted: '✅ Bạn đã chấp nhận lời cầu hôn!',
      declined: '❌ Bạn đã từ chối lời cầu hôn.',
    },
  },

  // Status embed fields
  status: {
    title: 'Trạng thái của {name}',
    marriageStatus: '💍 Trạng thái hôn nhân',
    marriedTo: 'Đã kết hôn với <@{partnerId}>',
    notMarried: 'Chưa kết hôn',
    marriedDate: '📅 Ngày kết hôn',
    totalDaysAttended: '📅 Tổng số ngày tham gia',
    lastAttendance: '📅 Lần tham gia cuối',
    attendance: '📅 Điểm danh',
    noAttendanceRecords: 'Không có bản ghi điểm danh',
    never: 'Chưa bao giờ',
    days: 'ngày',
    day: 'ngày',
    daysAgo: '{days} ngày trước',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
  },

  // Date formatting
  date: {
    months: [
      'tháng 1',
      'tháng 2',
      'tháng 3',
      'tháng 4',
      'tháng 5',
      'tháng 6',
      'tháng 7',
      'tháng 8',
      'tháng 9',
      'tháng 10',
      'tháng 11',
      'tháng 12',
    ],
    format: '{day} {month}, {year}',
  },
};

// Fix translation service to access nested date.months array
export function getTranslation(key: string): string | undefined {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Special handling for array indices (e.g., date.months.0)
      if (typeof value === 'object' && Array.isArray(value) && !isNaN(Number(k))) {
        const index = Number(k);
        if (index >= 0 && index < value.length) {
          value = value[index];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  }

  return typeof value === 'string' ? value : undefined;
}


