import type { GeoResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const GlobeIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
  </svg>
);

interface Props {
  data: GeoResult;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-slate-200">{value || "—"}</span>
    </div>
  );
}

export default function GeoCard({ data }: Props) {
  const mapUrl = data.lat && data.lon
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${data.lon - 2},${data.lat - 1.5},${data.lon + 2},${data.lat + 1.5}&layer=mapnik&marker=${data.lat},${data.lon}`
    : null;

  return (
    <Card
      title="Geolocation & ASN"
      icon={GlobeIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Map preview */}
        {mapUrl && (
          <div className="rounded-xl overflow-hidden border border-[#1e2d4a] h-40">
            <iframe
              src={mapUrl}
              className="w-full h-full border-0"
              loading="lazy"
              title={`Map showing location of ${data.ip}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}

        {/* Location grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="IP Address" value={data.ip} />
          <Field label="Country" value={`${data.country} (${data.countryCode})`} />
          <Field label="Region" value={data.region} />
          <Field label="City" value={data.city} />
          <Field label="Timezone" value={data.timezone} />
          <Field
            label="Coordinates"
            value={data.lat && data.lon ? `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}` : "—"}
          />
        </div>

        {/* Network info */}
        <div className="border-t border-[#162038] pt-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Network</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="ISP" value={data.isp} />
            <Field label="ASN" value={data.asn} />
            <Field label="Organisation" value={data.org} />
          </div>
        </div>
      </div>
    </Card>
  );
}
