import type { PlaceType } from './map';
import type { Stats } from './paths';

/** Kết quả của một lựa chọn. */
export interface Outcome {
  text: string;
  /** Năng lượng tu luyện nhận được. */
  energy?: number;
  /** Linh thạch được (dương) hoặc mất (âm). */
  linhThach?: number;
  /** Chỉ số được cộng. */
  stat?: [keyof Stats, number];
  /** Số ngày trôi qua. */
  days?: number;
}

export interface Choice {
  text: string;
  /** Có phép thử thì kết quả phụ thuộc chỉ số và vận may. */
  check?: { stat: keyof Stats; difficulty: number };
  /** Linh thạch phải có để chọn. */
  cost?: number;
  ok: Outcome;
  fail?: Outcome;
}

export interface GameEvent {
  id: string;
  title: string;
  /** Loại địa danh mà sự kiện có thể xuất hiện. */
  places: PlaceType[];
  text: string;
  choices: Choice[];
}

export const EVENTS: GameEvent[] = [
  {
    id: 'sapHang',
    title: 'Sạp hàng không biển hiệu',
    places: ['market'],
    text: 'Cuối dãy chợ có một sạp chỉ bày đúng một viên đá xám. Ông lão ngồi sau sạp không rao, không mời, chỉ giơ hai ngón tay: hai mươi linh thạch.',
    choices: [
      {
        text: 'Mua luôn (20 linh thạch)',
        cost: 20,
        check: { stat: 'ngoTinh', difficulty: 6 },
        ok: { text: 'Về tới nhà, lớp vỏ xám bong ra. Bên trong là một khối linh thạch thô còn ấm.', linhThach: -20, energy: 90 },
        fail: { text: 'Ngươi mài cả đêm. Nó vẫn là một viên đá cuội.', linhThach: -20 },
      },
      {
        text: 'Ngồi xuống trò chuyện với ông lão',
        check: { stat: 'thanThuc', difficulty: 5 },
        ok: { text: 'Ông lão kể chuyện linh khí trở lại năm xưa. Nghe xong, đầu óc ngươi sáng ra một chút.', stat: ['ngoTinh', 1], days: 1 },
        fail: { text: 'Ông lão ngủ gật giữa chừng. Ngươi ngồi đến tàn chợ.', days: 1 },
      },
      { text: 'Bỏ đi', ok: { text: 'Ngươi quay lưng. Lúc ngoảnh lại, sạp hàng đã không còn.' } },
    ],
  },
  {
    id: 'chuyenTauCuoi',
    title: 'Chuyến tàu cuối',
    places: ['station'],
    text: 'Chuyến tàu đêm dừng khựng giữa hầm. Đèn tắt. Trên nóc toa có tiếng gì đó bò chậm, nặng, từ đầu tàu về phía ngươi.',
    choices: [
      {
        text: 'Ngồi yên, nhắm mắt vận công',
        check: { stat: 'thanThuc', difficulty: 5 },
        ok: { text: 'Hơi thở ngươi chậm dần. Thứ trên nóc dừng lại ngay trên đầu, rồi bò đi. Tâm ngươi vững thêm một phần.', stat: ['thanThuc', 1] },
        fail: { text: 'Tim ngươi đập loạn. Thứ đó bỏ đi, còn ngươi mất ngủ mấy đêm liền.', days: 5 },
      },
      {
        text: 'Trèo lên nóc xem là thứ gì',
        check: { stat: 'thanPhap', difficulty: 7 },
        ok: { text: 'Một con dị thú non mắc kẹt trong dây cáp. Ngươi gỡ cho nó. Nó nhả lại một mảnh hạch vụn rồi biến vào bóng tối.', linhThach: 45 },
        fail: { text: 'Ngươi trượt chân, rơi xuống đường ray. Phải nằm dưỡng thương.', days: 12 },
      },
      { text: 'Mở cửa, đi bộ dọc hầm', ok: { text: 'Ngươi mò mẫm trong hầm đến sáng mới thấy ga kế tiếp.', days: 3 } },
    ],
  },
  {
    id: 'suongMatHo',
    title: 'Sương trên mặt hồ',
    places: ['spring'],
    text: 'Tờ mờ sáng, sương trên hồ tụ lại thành dáng một người ngồi xếp bằng. Nó không có mặt, nhưng ngươi biết nó đang nhìn mình.',
    choices: [
      {
        text: 'Ngồi xuống đối diện, thở theo nhịp của nó',
        check: { stat: 'ngoTinh', difficulty: 6 },
        ok: { text: 'Một hơi thở dài như cả mùa đông. Khi mở mắt, sương đã tan, còn linh khí thì đầy trong ngực.', energy: 110, days: 3 },
        fail: { text: 'Ngươi ngủ gục bên hồ. Tỉnh dậy đã là trưa hôm sau.', days: 2 },
      },
      { text: 'Chụp ảnh đăng lên mạng', ok: { text: 'Bức ảnh lan khắp Lạc Thành. Một tờ báo trả ngươi ít linh thạch để mua lại.', linhThach: 15 } },
      { text: 'Lặng lẽ rời đi', ok: { text: 'Có những thứ không nên nhìn lâu.' } },
    ],
  },
  {
    id: 'kiemTraThucTinh',
    title: 'Đợt đo thức tỉnh',
    places: ['guild'],
    text: 'Sảnh Tháp Bạch Mã dựng một trụ pha lê cao quá đầu người. Ai đặt tay lên mà trụ sáng thì được ghi tên vào sổ của hiệp hội.',
    choices: [
      {
        text: 'Đặt tay lên trụ',
        check: { stat: 'thanThuc', difficulty: 6 },
        ok: { text: 'Trụ pha lê sáng lên một vệt mảnh. Nhân viên gật đầu, đưa ngươi phong bì trợ cấp.', linhThach: 50, stat: ['thanThuc', 1] },
        fail: { text: 'Trụ im lìm. Người phía sau khẽ thở dài thay ngươi.' },
      },
      {
        text: 'Lẻn xem sổ ghi chép khi không ai để ý',
        check: { stat: 'thanPhap', difficulty: 7 },
        ok: { text: 'Một dòng ghi chú về điểm tụ linh khí trong thành. Ngươi tìm tới đó ngồi suốt mấy ngày.', energy: 80, days: 4 },
        fail: { text: 'Bảo vệ tóm được ngươi. Nộp phạt xong mới được ra.', linhThach: -20 },
      },
      { text: 'Đứng xem rồi về', ok: { text: 'Ngươi xem người ta sáng, người ta tắt, rồi về.' } },
    ],
  },
  {
    id: 'thachDau',
    title: 'Lời thách đấu',
    places: ['dojo'],
    text: 'Giữa sân võ quán, một gã to gấp đôi ngươi vừa quật ngã người thứ năm. Gã nhìn quanh, ánh mắt dừng lại ở ngươi: "Còn nhóc kia?"',
    choices: [
      {
        text: 'Bước lên sân',
        check: { stat: 'sucManh', difficulty: 7 },
        ok: { text: 'Ngươi chịu ba đòn, trả một đòn đúng chỗ. Gã cười lớn, ném cho ngươi túi tiền cược.', linhThach: 30, stat: ['sucManh', 1] },
        fail: { text: 'Ngươi tỉnh dậy trên chiếu, toàn thân ê ẩm. Nhưng đòn đau thì nhớ lâu.', stat: ['theChat', 1], days: 15 },
      },
      { text: 'Xin ở lại quét sân một tháng để học lỏm', ok: { text: 'Một tháng quét sân, gánh nước, đứng tấn. Thân thể ngươi rắn lại.', stat: ['theChat', 1], days: 30 } },
      { text: 'Lắc đầu', ok: { text: 'Gã nhún vai, tìm người khác.' } },
    ],
  },
  {
    id: 'bacDa',
    title: 'Bậc đá thứ chín trăm',
    places: ['sect'],
    text: 'Giữa đường lên đạo quán, một bà cụ gánh hai thùng nước đứng thở dốc. Còn hơn nghìn bậc nữa mới tới cổng.',
    choices: [
      {
        text: 'Gánh giúp bà cụ lên tới cổng',
        check: { stat: 'theChat', difficulty: 6 },
        ok: { text: 'Tới cổng, bà cụ chỉ cho ngươi một chỗ ngồi sau điện, nơi linh mạch trồi lên sát mặt đất.', energy: 140, days: 2 },
        fail: { text: 'Ngươi gục ở bậc một nghìn hai. Bà cụ phải gánh cả nước lẫn ngươi.', days: 8 },
      },
      {
        text: 'Hỏi bà cụ về đạo',
        check: { stat: 'ngoTinh', difficulty: 6 },
        ok: { text: '"Nước chảy chỗ trũng," bà cụ nói. Ngươi nghĩ về câu đó suốt đường xuống núi.', stat: ['ngoTinh', 1] },
        fail: { text: 'Bà cụ nói gì đó về nước. Ngươi không hiểu.' },
      },
      { text: 'Chào rồi leo tiếp', ok: { text: 'Ngươi leo tiếp. Tiếng thùng nước lắc nhỏ dần phía sau.' } },
    ],
  },
  {
    id: 'dauChan',
    title: 'Dấu chân còn ướt',
    places: ['beast'],
    text: 'Trên nền đất có một hàng dấu chân ba ngón, to bằng cái mâm, nước còn đọng trong lòng. Chủ nhân của chúng chưa đi xa.',
    choices: [
      {
        text: 'Lần theo dấu chân',
        check: { stat: 'thanPhap', difficulty: 7 },
        ok: { text: 'Con dị thú đang lột xác. Ngươi nhặt được lớp vảy cũ, mang về bán được giá.', linhThach: 60, days: 2 },
        fail: { text: 'Nó phát hiện ra ngươi trước. Ngươi chạy thoát, nhưng không lành lặn.', days: 30 },
      },
      {
        text: 'Đặt bẫy rồi nằm chờ',
        check: { stat: 'ngoTinh', difficulty: 5 },
        ok: { text: 'Mười ngày sau, bẫy sập. Không phải con to, nhưng cũng có hạch.', linhThach: 35, days: 10 },
        fail: { text: 'Mười ngày nằm chờ. Cái bẫy vẫn trống.', days: 10 },
      },
      { text: 'Quay lại', ok: { text: 'Còn sống thì còn tu được.' } },
    ],
  },
  {
    id: 'linhDuoc',
    title: 'Linh dược bên vực',
    places: ['beast', 'secret'],
    text: 'Một nhánh cỏ phát sáng mọc chìa ra từ vách đá, bên dưới là vực sâu không thấy đáy. Quả của nó mới chín một nửa.',
    choices: [
      {
        text: 'Trèo ra hái ngay',
        check: { stat: 'thanPhap', difficulty: 7 },
        ok: { text: 'Ngươi hái được, nuốt tại chỗ. Một luồng ấm chạy dọc sống lưng.', energy: 150 },
        fail: { text: 'Hòn đá dưới chân lở ra. Ngươi bám được vào rễ cây, leo lên với một bên vai trật khớp.', days: 20 },
      },
      { text: 'Dựng lều chờ quả chín hẳn', ok: { text: 'Một tháng canh từng đêm. Quả chín, không ai tranh.', energy: 110, days: 30 } },
      { text: 'Đánh dấu chỗ này rồi đi', ok: { text: 'Ngươi khắc một dấu lên thân cây. Lần sau quay lại, nếu còn.' } },
    ],
  },
  {
    id: 'tiengVong',
    title: 'Tiếng vọng trong động',
    places: ['secret'],
    text: 'Từ trong lòng động vọng ra tiếng ai đó gọi tên ngươi. Đúng tên, đúng giọng của một người ngươi chưa từng gặp trong kiếp này.',
    choices: [
      {
        text: 'Đi theo tiếng gọi',
        check: { stat: 'thanThuc', difficulty: 8 },
        ok: { text: 'Cuối hang là một vách đá phẳng như gương. Ngươi thấy trong đó một bóng người ngồi tu luyện, và nhớ ra đó là ai.', energy: 220, stat: ['thanThuc', 1], days: 5 },
        fail: { text: 'Ngươi lạc trong động hai tháng trời, ăn rêu uống nước nhỏ giọt mới tìm được đường ra.', days: 60 },
      },
      { text: 'Bịt tai, quay ra', ok: { text: 'Tiếng gọi đuổi theo ngươi tới tận cửa động rồi mới tắt.' } },
    ],
  },
  {
    id: 'buuKien',
    title: 'Bưu kiện không người gửi',
    places: ['home'],
    text: 'Trước cửa có một gói giấy dầu buộc dây gai. Không tem, không tên người gửi, chỉ có tên ngươi viết bằng mực đỏ.',
    choices: [
      {
        text: 'Mở ra',
        check: { stat: 'ngoTinh', difficulty: 6 },
        ok: { text: 'Một cuốn sổ chép tay, thiếu nửa sau. Nửa trước đủ để ngươi hiểu thêm về cách dẫn khí.', stat: ['ngoTinh', 1] },
        fail: { text: 'Một lá bùa bốc cháy ngay trên tay. Ngươi băng bó mất một tuần.', days: 7 },
      },
      { text: 'Mang ra chợ bán nguyên gói', ok: { text: 'Có kẻ trả tiền mà không hỏi bên trong là gì.', linhThach: 25 } },
      { text: 'Để nguyên đó', ok: { text: 'Sáng hôm sau, gói giấy đã biến mất.' } },
    ],
  },
  {
    id: 'matDien',
    title: 'Đêm mất điện',
    places: ['home', 'market', 'station', 'guild'],
    text: 'Cả Lạc Thành tắt đèn cùng một lúc. Trong bóng tối, ngươi thấy rõ những sợi linh khí mảnh như tơ trôi giữa các tòa nhà.',
    choices: [
      { text: 'Lên sân thượng ngồi thiền đến sáng', ok: { text: 'Không có ánh đèn, linh khí dễ nắm hơn hẳn.', energy: 50, days: 1 } },
      {
        text: 'Xuống phố giúp người mắc kẹt trong thang máy',
        check: { stat: 'sucManh', difficulty: 5 },
        ok: { text: 'Ngươi cạy được ba cánh cửa. Một người trong số đó dúi vào tay ngươi ít linh thạch.', linhThach: 30 },
        fail: { text: 'Ngươi cố hết sức mà cửa không nhúc nhích. Đội cứu hộ tới sau đó.' },
      },
      { text: 'Đi ngủ', ok: { text: 'Sáng ra điện có lại. Không ai giải thích gì.' } },
    ],
  },
];

export function eventById(id: string): GameEvent | undefined {
  return EVENTS.find((item) => item.id === id);
}
