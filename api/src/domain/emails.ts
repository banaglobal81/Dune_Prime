import {
  INQUIRER_TYPE_LABELS,
  describeSource,
  type InquiryRecord,
  type SupportedLocale,
} from "./inquiry.js";
import type { EmailMessage } from "../ports.js";

/**
 * Email copy. The auto-reply follows the site's tone and legal line: no figures and
 * no promises; a person replies, usually the same day.
 */

const AUTO_REPLY: Record<SupportedLocale, { subject: string; body: (name: string) => string }> = {
  en: {
    subject: "We have your message · Dune Prime",
    body: (name) =>
      [
        `Dear ${name},`,
        "",
        "Thank you for writing to Dune Prime Holiday Homes. We have your inquiry, and a member of our team will reply personally, usually within the same day (9:00 to 21:00, Gulf Standard Time).",
        "",
        "If you would like to add anything, simply reply to this email.",
        "",
        "Kind regards,",
        "Dune Prime Holiday Homes L.L.C.",
        "DET Licence 1657365 · Dubai, United Arab Emirates",
        "https://dunepr.com",
      ].join("\n"),
  },
  ko: {
    subject: "문의가 접수되었습니다 · Dune Prime",
    body: (name) =>
      [
        `${name}님, 안녕하세요.`,
        "",
        "Dune Prime Holiday Homes에 문의해 주셔서 감사합니다. 문의 내용을 잘 받았으며, 담당자가 대부분 당일에 직접 답변드립니다(두바이 시간 오전 9시~오후 9시).",
        "",
        "추가로 전하실 내용이 있으면 이 메일에 회신해 주세요.",
        "",
        "감사합니다.",
        "Dune Prime Holiday Homes L.L.C.",
        "DET 상업 라이선스 1657365 · 두바이, 아랍에미리트",
        "https://dunepr.com/ko/",
      ].join("\n"),
  },
};

export function autoReplyEmail(record: InquiryRecord, replyTo?: string): EmailMessage {
  const copy = AUTO_REPLY[record.locale];
  return {
    to: [record.email],
    subject: copy.subject,
    text: copy.body(record.name),
    replyTo: record.owner.email ?? replyTo,
  };
}

function summary(record: InquiryRecord): string {
  return [
    `Type:     ${INQUIRER_TYPE_LABELS[record.type]}`,
    `Name:     ${record.name}`,
    `Email:    ${record.email}`,
    `Phone:    ${record.phone || "-"}`,
    `Owner:    ${record.owner.name}`,
    `Language: ${record.locale}`,
    `Source:   ${describeSource(record.source)}${record.source.page ? ` (page ${record.source.page})` : ""}`,
    `Received: ${record.receivedAt}`,
    `ID:       ${record.id}`,
    "",
    "Message:",
    record.message || "-",
  ].join("\n");
}

export function teamAlertEmail(record: InquiryRecord, to: string[]): EmailMessage {
  return {
    to,
    subject: `New inquiry · ${INQUIRER_TYPE_LABELS[record.type]} · ${record.name}`,
    text: [
      'A new inquiry arrived on dunepr.com. Please reply the same day and set its status to "Contacted" in the inquiry sheet.',
      "",
      summary(record),
      "",
      "Rule: no figures go to financial partners before an NDA.",
    ].join("\n"),
    replyTo: record.email,
  };
}

export function reminderEmail(record: InquiryRecord, to: string[], hours: number): EmailMessage {
  return {
    to,
    subject: `Not contacted after ${hours}h · ${INQUIRER_TYPE_LABELS[record.type]} · ${record.name}`,
    text: [
      `This inquiry is still "New" more than ${hours} hours after it arrived. Please contact the person and update the status in the inquiry sheet.`,
      "",
      summary(record),
    ].join("\n"),
    replyTo: record.email,
  };
}
