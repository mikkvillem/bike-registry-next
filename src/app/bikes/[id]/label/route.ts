import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { db } from "@/db";
import { bicycle } from "@/db/schema/schema";
import { generateQrPng } from "@/lib/qr";
import { getSession } from "@/lib/session";
import { getSiteUrl } from "@/lib/site-url";

const MM_TO_PT = 2.834645669;
const mm = (value: number) => value * MM_TO_PT;

// Printable QR label as a PDF: a single small tag sized for a sticker/keyring
// print, with the bike's QR code linking to its public status page. Only the
// owner can generate it (the file may later carry more than the public page
// does), so this route requires an authenticated session.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [bike] = await db
    .select()
    .from(bicycle)
    .where(and(eq(bicycle.id, id), isNull(bicycle.deletedAt)))
    .limit(1);

  if (!bike || bike.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const siteUrl = await getSiteUrl();
  const publicUrl = `${siteUrl}/b/${bike.id}`;
  const qrPng = await generateQrPng(publicUrl);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const qrImage = await pdfDoc.embedPng(qrPng);

  const pageWidth = mm(100);
  const pageHeight = mm(140);
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const title = "Bike Registry";
  const titleSize = 14;
  const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - mm(12),
    size: titleSize,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const qrSize = mm(60);
  page.drawImage(qrImage, {
    x: (pageWidth - qrSize) / 2,
    y: pageHeight - mm(20) - qrSize,
    width: qrSize,
    height: qrSize,
  });

  const bikeLabel = bike.type ?? "Bike";
  const bikeLabelSize = 11;
  const bikeLabelWidth = font.widthOfTextAtSize(bikeLabel, bikeLabelSize);
  page.drawText(bikeLabel, {
    x: (pageWidth - bikeLabelWidth) / 2,
    y: pageHeight - mm(28) - qrSize,
    size: bikeLabelSize,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const instructions = "Scan to check registration & theft status";
  const instructionsSize = 8;
  const instructionsWidth = font.widthOfTextAtSize(
    instructions,
    instructionsSize,
  );
  page.drawText(instructions, {
    x: (pageWidth - instructionsWidth) / 2,
    y: pageHeight - mm(35) - qrSize,
    size: instructionsSize,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const urlSize = 7;
  const urlWidth = font.widthOfTextAtSize(publicUrl, urlSize);
  page.drawText(publicUrl, {
    x: (pageWidth - urlWidth) / 2,
    y: mm(8),
    size: urlSize,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bike-${bike.id}-label.pdf"`,
    },
  });
}
