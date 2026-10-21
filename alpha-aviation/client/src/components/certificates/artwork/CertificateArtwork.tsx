import { forwardRef } from "react";
import { CERT_FONT } from "@/lib/certificates/fonts";
import { CANVAS, CENTER_X, QR_BOX, guillochePath, type CertificateLayout } from "@/lib/certificates/layout";
import type { CertificateAssets, CertificateWatermark } from "@/lib/certificates/preview";
import { buildQrGeometry } from "@/lib/certificates/qr";
import { signatureFor } from "@/lib/certificates/signatures";
import { CERTIFICATE_TEMPLATE as TPL, CERT_COLORS as C } from "@/lib/certificates/template";
import type { CertificateArtworkData } from "@/lib/certificates/types";
import { formatVerificationCode } from "@/lib/certificates/validation";
import {
  BrandSymbol,
  CornerOrnament,
  Flag,
  Flourish,
  Globe,
  GoldRosette,
  InstitutionSeal,
  MonogramBadge,
  Rule,
} from "./ornaments";

interface CertificateArtworkProps {
  data: CertificateArtworkData;
  layout: CertificateLayout;
  assets: CertificateAssets;
  /** Inlined @font-face rules, only for standalone (exported) SVG. */
  fontCss?: string;
  watermark?: CertificateWatermark;
  /** Unique per instance so gradient ids never collide when several render on one page. */
  idPrefix: string;
  className?: string;
}

const { width: W, height: H } = CANVAS;

const WATERMARK_TEXT: Record<Exclude<CertificateWatermark, null>, string> = {
  specimen: "SPECIMEN",
  revoked: "REVOKED",
  superseded: "SUPERSEDED",
};

function QrMark({ url, code, symbolHref, ids }: { url?: string | null; code?: string | null; symbolHref: string; ids: { clip: string } }) {
  const { x, y, size } = QR_BOX;
  if (!url) {
    return (
      <g>
        <rect x={x} y={y} width={size} height={size} rx={10} fill="#FFFFFF" stroke={C.line} strokeWidth={2} strokeDasharray="6 6" />
        <g opacity={0.35} fill={C.navy}>
          {[0, 1, 2].map((i) => {
            const fx = i === 1 ? x + size - 46 : x + 14;
            const fy = i === 2 ? y + size - 46 : y + 14;
            return (
              <g key={i}>
                <rect x={fx} y={fy} width={32} height={32} rx={7} fill="none" stroke={C.navy} strokeWidth={5} />
                <rect x={fx + 10} y={fy + 10} width={12} height={12} rx={3} />
              </g>
            );
          })}
        </g>
        <text x={x + size / 2} y={y + size / 2 + 26} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={600} fontSize={11} fill={C.muted}>
          Generated on issue
        </text>
        <text x={x + size / 2} y={y + size + 21} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={12} letterSpacing={2} fill={C.navy}>
          VERIFY CERTIFICATE
        </text>
      </g>
    );
  }

  const qr = buildQrGeometry(url);
  const quiet = 2;
  const unit = size / (qr.size + quiet * 2);
  const ox = x + quiet * unit;
  const oy = y + quiet * unit;
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={8} fill="#FFFFFF" stroke={C.line} strokeWidth={1.5} />
      <path d={qr.modulesPath} transform={`translate(${ox} ${oy}) scale(${unit})`} fill={C.navy} />
      {qr.finders.map(([fc, fr], i) => (
        <g key={i} transform={`translate(${ox + fc * unit} ${oy + fr * unit})`}>
          <rect x={unit * 0.5} y={unit * 0.5} width={unit * 6} height={unit * 6} rx={unit * 1.6} fill="none" stroke={C.navy} strokeWidth={unit} />
          <rect x={unit * 2} y={unit * 2} width={unit * 3} height={unit * 3} rx={unit * 0.8} fill={C.blue} />
        </g>
      ))}
      {qr.logo && (
        <g>
          <rect
            x={ox + qr.logo.x * unit + unit * 0.35}
            y={oy + qr.logo.y * unit + unit * 0.35}
            width={qr.logo.size * unit - unit * 0.7}
            height={qr.logo.size * unit - unit * 0.7}
            rx={unit * 1.4}
            fill="#FFFFFF"
          />
          <clipPath id={ids.clip}>
            <rect x={ox + qr.logo.x * unit} y={oy + qr.logo.y * unit} width={qr.logo.size * unit} height={qr.logo.size * unit} />
          </clipPath>
          <g clipPath={`url(#${ids.clip})`}>
            <BrandSymbol
              href={symbolHref}
              x={ox + qr.logo.x * unit + unit * 1.1}
              y={oy + (qr.logo.y + qr.logo.size / 2) * unit - ((qr.logo.size - 2.2) * unit * BrandSymbol.aspect) / 2}
              width={(qr.logo.size - 2.2) * unit}
            />
          </g>
        </g>
      )}
      <text x={x + size / 2} y={y + size + 21} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={12} letterSpacing={2} fill={C.navy}>
        VERIFY CERTIFICATE
      </text>
      {code && (
        <text x={x + size / 2} y={y + size + 37} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={600} fontSize={11} letterSpacing={1} fill={C.muted}>
          {formatVerificationCode(code)}
        </text>
      )}
    </g>
  );
}

/** Box a traced signature is fitted into; its foot overlaps the rule slightly, like real ink. */
const SIGNATURE_BOX = { width: 236, height: 76, bottom: 1023 };

function Signature({ cx, sig, ids }: { cx: number; sig: CertificateLayout["signatures"][number]; ids: { gold: string } }) {
  const art = signatureFor(sig.name);
  let ink = null;
  if (art) {
    const [, , vbW, vbH] = art.viewBox.split(" ").map(Number);
    const scale = Math.min(SIGNATURE_BOX.width / vbW, SIGNATURE_BOX.height / vbH);
    const w = vbW * scale;
    const h = vbH * scale;
    ink = (
      <svg x={cx - w / 2} y={SIGNATURE_BOX.bottom - h} width={w} height={h} viewBox={art.viewBox} overflow="visible">
        <path d={art.d} fill={C.night} fillRule="evenodd" />
      </svg>
    );
  }
  return (
    <g>
      {ink ?? (
        <text x={cx} y={1004} textAnchor="middle" fontFamily={CERT_FONT.script} fontWeight={400} fontSize={sig.scriptSize} fill={C.night}>
          {sig.script}
        </text>
      )}
      <Rule x1={cx - 122} y1={1018} x2={cx + 122} y2={1018} thickness={1.6} fill={`url(#${ids.gold})`} />
      <text x={cx} y={1048} textAnchor="middle" fontFamily={CERT_FONT.serif} fontWeight={600} fontSize={sig.nameSize} fill={C.navy}>
        {sig.name}
      </text>
      {sig.title && (
        <text x={cx} y={1070} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={600} fontSize={12.5} fill={C.ink}>
          {sig.title}
        </text>
      )}
      {sig.organisation && (
        <text x={cx} y={1089} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={500} fontSize={12} fill={C.muted}>
          {sig.organisation}
        </text>
      )}
    </g>
  );
}

function SeparatedLine({
  items,
  x,
  y,
  anchor,
  size,
  weight,
  tracking,
  fill,
  separator,
}: {
  items: readonly string[];
  x: number;
  y: number;
  anchor: "start" | "middle";
  size: number;
  weight: number;
  tracking: number;
  fill: string;
  separator: string;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={CERT_FONT.sans} fontWeight={weight} fontSize={size} letterSpacing={tracking} fill={fill}>
      {items.map((item, i) => (
        <tspan key={item}>
          {i > 0 && <tspan fill={separator}>{"   |   "}</tspan>}
          {item.toUpperCase()}
        </tspan>
      ))}
    </text>
  );
}

/**
 * The certificate, drawn on an A4-landscape canvas. Pure function of its props:
 * the same component renders the live preview and the exported files.
 */
export const CertificateArtwork = forwardRef<SVGSVGElement, CertificateArtworkProps>(function CertificateArtwork(
  { data, layout, assets, fontCss, watermark = null, idPrefix, className },
  ref,
) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const ids = {
    gold: id("gold"),
    goldV: id("gold-v"),
    goldDeep: id("gold-deep"),
    navy: id("navy"),
    globe: id("globe"),
    paper: id("paper"),
    fade: id("fade"),
  };
  const ACC = TPL.accreditations;
  const NET = TPL.network;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={className}
      role="img"
      aria-label={`${layout.title.text} ${layout.subtitle.toLowerCase()} awarded to ${data.fullName}`}
      textRendering="geometricPrecision"
    >
      <defs>
        {fontCss && <style dangerouslySetInnerHTML={{ __html: fontCss }} />}
        <linearGradient id={ids.gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9D4A0" />
          <stop offset="0.45" stopColor={C.gold} />
          <stop offset="0.75" stopColor="#C9A55C" />
          <stop offset="1" stopColor={C.goldDeep} />
        </linearGradient>
        <linearGradient id={ids.goldV} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.gold} stopOpacity="0" />
          <stop offset="0.2" stopColor={C.gold} />
          <stop offset="0.5" stopColor="#D8BC7A" />
          <stop offset="0.8" stopColor={C.gold} />
          <stop offset="1" stopColor={C.gold} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={ids.goldDeep} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#D9BC78" />
          <stop offset="0.6" stopColor={C.gold} />
          <stop offset="1" stopColor={C.goldDeep} />
        </radialGradient>
        <radialGradient id={ids.navy} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#1A3A78" />
          <stop offset="1" stopColor={C.night} />
        </radialGradient>
        <radialGradient id={ids.globe} cx="0.38" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#5B86FF" />
          <stop offset="0.55" stopColor={C.blue} />
          <stop offset="1" stopColor="#0A2A7A" />
        </radialGradient>
        <radialGradient id={ids.paper} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F7F4EC" />
        </radialGradient>
      </defs>

      {/* Frame: navy border, gold corner caps, warm paper, double gold rule */}
      <rect width={W} height={H} fill={C.night} />
      {[
        `M0 0 H76 L0 76 Z`,
        `M${W} 0 H${W - 76} L${W} 76 Z`,
        `M0 ${H} H76 L0 ${H - 76} Z`,
        `M${W} ${H} H${W - 76} L${W} ${H - 76} Z`,
      ].map((d) => (
        <path key={d} d={d} fill={`url(#${ids.gold})`} />
      ))}
      <rect x={26} y={26} width={W - 52} height={H - 52} fill={`url(#${ids.paper})`} />
      <rect x={38} y={38} width={W - 76} height={1102} fill="none" stroke={`url(#${ids.gold})`} strokeWidth={2.5} />
      <rect x={46} y={46} width={W - 92} height={1086} fill="none" stroke={C.gold} strokeOpacity={0.55} strokeWidth={1} />

      {/* Security background */}
      <path d={guillochePath()} transform={`translate(${CENTER_X} 712)`} fill="none" stroke={C.blue} strokeOpacity={0.07} strokeWidth={0.8} />
      <BrandSymbol href={assets.symbolBlue} x={CENTER_X - 250} y={712 - 250 * BrandSymbol.aspect} width={500} opacity={0.045} />

      <CornerOrnament gold={C.gold} />
      <CornerOrnament gold={C.gold} transform={`translate(${W} 0) scale(-1 1)`} />
      {/* Inner frame spans y 38–1140, so bottom corners mirror about y = 589 (1178 / 2) */}
      <CornerOrnament gold={C.gold} compact transform="translate(0 1178) scale(1 -1)" />
      <CornerOrnament gold={C.gold} compact transform={`translate(${W} 1178) scale(-1 -1)`} />

      {/* Header — emblem */}
      <InstitutionSeal cx={198} cy={176} symbolHref={assets.symbolWhite} ids={{ navy: ids.navy, gold: ids.gold }} />
      <text textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={700} fontSize={11} letterSpacing={1.6} fill={C.navy}>
        {TPL.institution.sealTagline
          .toUpperCase()
          .split(/(?<=\.)\s+/)
          .map((line, i) => (
            <tspan key={line} x={199} y={304 + i * 16}>
              {line}
            </tspan>
          ))}
      </text>

      {/* Header — institution */}
      <text x={CENTER_X} y={130} textAnchor="middle" fontFamily={CERT_FONT.display} fontWeight={700} fontSize={58} letterSpacing={2.4} fill={C.navy}>
        {TPL.institution.name.toUpperCase()}
      </text>
      <text x={CENTER_X} y={180} textAnchor="middle" fontFamily={CERT_FONT.display} fontWeight={700} fontSize={40} letterSpacing={5} fill={C.navy}>
        {TPL.institution.division.toUpperCase()}
      </text>
      <text x={CENTER_X} y={216} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={700} fontSize={13.5} letterSpacing={3} fill={C.blue}>
        {TPL.institution.memberLine.toUpperCase()}
      </text>
      <SeparatedLine items={TPL.institution.pillars} x={CENTER_X} y={244} anchor="middle" size={13} weight={600} tracking={2.6} fill={C.ink} separator={C.gold} />
      <Flourish cx={CENTER_X} y={266} width={420} gold={C.gold} />
      <text x={CENTER_X} y={294} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={700} fontSize={12} letterSpacing={2.6} fill={C.gold}>
        {TPL.institution.mission.toUpperCase()}
      </text>

      {/* Header — partnerships */}
      <Rule x1={1312} y1={86} x2={1312} y2={282} thickness={1.6} fill={`url(#${ids.gold})`} />
      <text fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={19} fill={C.navy}>
        <tspan x={1338} y={112}>{TPL.partnerships.heading[0]}</tspan>
        <tspan x={1338} y={138}>{TPL.partnerships.heading[1]}</tspan>
      </text>
      <Globe cx={1626} cy={124} r={35} ids={{ globe: ids.globe, clip: id("globe-clip"), gold: ids.gold }} />
      <Flag code="eu" x={1338} y={164} w={66} h={44} clipId={id("flag-eu-head")} />
      <text x={1418} y={184} fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={16} letterSpacing={0.3} fill={C.navy}>
        PIC NO: {TPL.partnerships.euPic}
      </text>
      <text x={1418} y={204} fontFamily={CERT_FONT.sans} fontWeight={600} fontSize={11} letterSpacing={1.4} fill={C.muted}>
        {TPL.partnerships.euRegisterLabel.toUpperCase()}
      </text>
      <SeparatedLine items={TPL.partnerships.values} x={1338} y={252} anchor="start" size={11.5} weight={700} tracking={1.8} fill={C.navy} separator={C.gold} />

      {/* Left panel — accreditations */}
      <rect x={64} y={336} width={272} height={556} rx={14} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
      <text textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={12} letterSpacing={1.8} fill={C.navy}>
        <tspan x={200} y={370}>{ACC.heading[0].toUpperCase()}</tspan>
        <tspan x={200} y={388}>{ACC.heading[1].toUpperCase()}</tspan>
      </text>
      <Rule x1={168} y1={404} x2={232} y2={404} thickness={2} fill={`url(#${ids.gold})`} />
      {ACC.items.map((item, i) => {
        const top = 424 + i * 92;
        const logo = assets.accreditationLogos?.[item.mark];
        return (
          <g key={item.mark}>
            {logo ? (
              <g>
                <rect x={74} y={top + 3} width={72} height={62} rx={10} fill="#FFFFFF" stroke={C.line} strokeWidth={1} />
                <image href={logo} x={77} y={top + 6} width={66} height={56} preserveAspectRatio="xMidYMid meet" />
              </g>
            ) : (
              <MonogramBadge cx={112} cy={top + 34} mark={item.mark} gold={C.gold} />
            )}
            <text x={152} y={top + 26} fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={20} letterSpacing={0.6} fill={C.navy}>
              {item.mark}
            </text>
            <text fontFamily={CERT_FONT.sans} fontWeight={600} fontSize={9.6} letterSpacing={0.5} fill={C.muted}>
              {item.lines.map((line, j) => (
                <tspan key={line} x={152} y={top + 43 + j * 13}>
                  {line.toUpperCase()}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Right panel — partner network */}
      <rect x={1418} y={336} width={272} height={556} rx={14} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
      <text textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={12} letterSpacing={1.8} fill={C.navy}>
        <tspan x={1554} y={370}>{NET.heading[0].toUpperCase()}</tspan>
        <tspan x={1554} y={388}>{NET.heading[1].toUpperCase()}</tspan>
      </text>
      <Rule x1={1522} y1={404} x2={1586} y2={404} thickness={2} fill={`url(#${ids.gold})`} />
      {NET.items.map((item, i) => {
        const top = 420 + i * 55;
        return (
          <g key={item.flag}>
            <Flag code={item.flag} x={1436} y={top + 4} w={50} h={33} clipId={id(`flag-${item.flag}`)} />
            <text x={1500} y={top + 17} fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={14} fill={C.navy}>
              {item.name}
            </text>
            <text fontFamily={CERT_FONT.sans} fontWeight={500} fontSize={10.4} fill={C.muted}>
              {item.lines.map((line, j) => (
                <tspan key={line} x={1500} y={top + 31 + j * 12.5}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
      <g>
        <Globe cx={1461} cy={826} r={16} ids={{ globe: ids.globe, clip: id("globe-mini"), gold: ids.gold }} />
        <text x={1500} y={822} fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={12.5} fill={C.navy}>
          {NET.more.name}
        </text>
        <text fontFamily={CERT_FONT.sans} fontWeight={500} fontSize={10.4} fill={C.muted}>
          {NET.more.lines.map((line, j) => (
            <tspan key={line} x={1500} y={838 + j * 12.5}>
              {line}
            </tspan>
          ))}
        </text>
      </g>

      {/* Title */}
      {/* Centred text with tracking is nudged by half a space: browsers add tracking after the last glyph too */}
      <text x={CENTER_X + layout.title.size * 0.025} y={414} textAnchor="middle" fontFamily={CERT_FONT.display} fontWeight={700} fontSize={layout.title.size} letterSpacing={layout.title.size * 0.05} fill={C.navy}>
        {layout.title.text}
      </text>
      <text x={CENTER_X + 4.5} y={462} textAnchor="middle" fontFamily={CERT_FONT.display} fontWeight={600} fontSize={30} letterSpacing={9} fill={C.navy}>
        {layout.subtitle}
      </text>
      <Rule x1={CENTER_X - layout.subtitleHalfWidth - 132} y1={452} x2={CENTER_X - layout.subtitleHalfWidth - 18} y2={452} thickness={2} fill={`url(#${ids.goldV})`} />
      <Rule x1={CENTER_X + layout.subtitleHalfWidth + 18} y1={452} x2={CENTER_X + layout.subtitleHalfWidth + 132} y2={452} thickness={2} fill={`url(#${ids.goldV})`} />
      <Flourish cx={CENTER_X} y={488} width={150} gold={C.gold} />
      <text x={CENTER_X + 2.2} y={528} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={700} fontSize={14.5} letterSpacing={4.4} fill={C.muted}>
        THIS IS TO CERTIFY THAT
      </text>

      {/* Recipient */}
      {layout.name.lines.map((line) => (
        <text
          key={line.y}
          x={CENTER_X}
          y={line.y}
          textAnchor="middle"
          fontFamily={CERT_FONT.name}
          fontWeight={700}
          fontSize={layout.name.size}
          letterSpacing={line.compressTo ? 0 : layout.name.size * 0.02}
          fill={C.navy}
          {...(line.compressTo ? { textLength: line.compressTo, lengthAdjust: "spacingAndGlyphs" } : {})}
        >
          {line.text}
        </text>
      ))}
      <Rule x1={CENTER_X - layout.rule.halfWidth} y1={layout.rule.y} x2={CENTER_X + layout.rule.halfWidth} y2={layout.rule.y} thickness={2} fill={`url(#${ids.goldV})`} />

      {/* Award statement */}
      <text x={CENTER_X} y={layout.lead.y} textAnchor="middle" fontFamily={CERT_FONT.serif} fontWeight={400} fontSize={layout.lead.size} fill={C.ink}>
        {layout.lead.text}
      </text>
      {layout.programmes.lines.map((line) => (
        <text key={line.y} x={CENTER_X} y={line.y} textAnchor="middle" fontFamily={CERT_FONT.serif} fontWeight={600} fontSize={layout.programmes.size} fill={C.navy}>
          {line.text}
        </text>
      ))}
      {layout.body.lines.map((line) => (
        <text key={line.y} x={CENTER_X} y={line.y} textAnchor="middle" fontFamily={CERT_FONT.serif} fontWeight={400} fontSize={layout.body.size} fill="#44546C">
          {line.text}
        </text>
      ))}
      <text x={CENTER_X} y={layout.congratulations.y} textAnchor="middle" fontFamily={CERT_FONT.serif} fontStyle="italic" fontWeight={400} fontSize={layout.congratulations.size} fill={C.navy}>
        {layout.congratulations.text}
      </text>

      <GoldRosette cx={1340} cy={806} r={66} ids={{ gold: ids.gold, goldDeep: ids.goldDeep }} />

      {/* Footer row — verification, signatures, registry details */}
      <QrMark url={data.verifyUrl} code={data.verificationCode} symbolHref={assets.symbolBlue} ids={{ clip: id("qr-logo") }} />
      {layout.signatures[0] && <Signature cx={456} sig={layout.signatures[0]} ids={{ gold: ids.gold }} />}
      {layout.signatures[1] && <Signature cx={1298} sig={layout.signatures[1]} ids={{ gold: ids.gold }} />}

      <Rule x1={640} y1={950} x2={640} y2={1086} thickness={1.4} fill={`url(#${ids.gold})`} />
      <Rule x1={1114} y1={950} x2={1114} y2={1086} thickness={1.4} fill={`url(#${ids.gold})`} />
      {[
        ["CERTIFICATE ID:", layout.meta.serial],
        ["DATE OF COMPLETION:", layout.meta.date],
        ["MODE OF TRAINING:", layout.meta.mode],
      ].map(([label, value], i) => (
        <g key={label}>
          <text x={664} y={990 + i * 38} fontFamily={CERT_FONT.sans} fontWeight={700} fontSize={11} letterSpacing={1.2} fill={C.muted}>
            {label}
          </text>
          <text
            x={862}
            y={990 + i * 38}
            fontFamily={CERT_FONT.sans}
            fontWeight={700}
            fontSize={layout.meta.valueSize}
            fill={!data.serial && i === 0 ? C.muted : C.navy}
            fontStyle={!data.serial && i === 0 ? "italic" : "normal"}
          >
            {value}
          </text>
        </g>
      ))}

      <text textAnchor="middle" fontFamily={CERT_FONT.serif} fontWeight={600} fontSize={21} fill={C.navy}>
        {TPL.institution.closingTagline.map((line, i) => (
          <tspan key={line} x={1566} y={1000 + i * 26}>
            {line}
          </tspan>
        ))}
      </text>
      <Rule x1={1506} y1={1084} x2={1626} y2={1084} thickness={1.6} fill={`url(#${ids.goldV})`} />

      {/* Footer band */}
      <rect x={26} y={1150} width={W - 52} height={64} fill={C.night} />
      <Rule x1={26} y1={1150} x2={W - 26} y2={1150} thickness={2.5} fill={`url(#${ids.gold})`} />
      <SeparatedLine items={TPL.regions} x={700} y={1188} anchor="middle" size={14} weight={700} tracking={3.6} fill="#FFFFFF" separator={C.goldLight} />
      <path d={`M1352 1150 H${W - 26} V1214 H1322 Z`} fill={`url(#${ids.gold})`} />
      <text x={1534} y={1189} textAnchor="middle" fontFamily={CERT_FONT.sans} fontWeight={800} fontSize={17} letterSpacing={0.6} fill={C.night}>
        {TPL.institution.website}
      </text>

      {watermark && (
        <text
          x={CENTER_X}
          y={700}
          textAnchor="middle"
          transform={`rotate(-22 ${CENTER_X} 700)`}
          fontFamily={CERT_FONT.display}
          fontWeight={700}
          fontSize={watermark === "superseded" ? 150 : 190}
          letterSpacing={16}
          fill={watermark === "specimen" ? C.blue : C.revoked}
          fillOpacity={watermark === "specimen" ? 0.06 : 0.16}
          stroke={watermark === "specimen" ? "none" : C.revoked}
          strokeOpacity={0.35}
          strokeWidth={2}
        >
          {WATERMARK_TEXT[watermark]}
        </text>
      )}
    </svg>
  );
});
