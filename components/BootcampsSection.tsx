import { ArrowUpRight } from "lucide-react";
import type { Bootcamp } from "@/lib/bootcamps";
import { formatPrice, formatStartDate, imageUrl, STATUS_LABEL } from "@/lib/bootcamp-format";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Upcoming bootcamps, managed from /admin → Bootcamps. */
export function BootcampsSection({ bootcamps, communityUrl }: { bootcamps: Bootcamp[]; communityUrl: string }) {
  return (
    <section className="section bootcamps" id="bootcamps">
      <div className="wrap">
        <div className="section-head">
          <h2>Upcoming bootcamps</h2>
          <p>
            Live, cohort-based classes on Zero Club. Pick a bootcamp and register to secure your place.
          </p>
        </div>

        {bootcamps.length === 0 ? (
          <div className="bootcamps-empty">
            <p>New bootcamps are announced in our community first.</p>
            <a href={communityUrl} {...external} className="btn btn-primary">
              Join Our Community <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <ul className={`bootcamp-grid${bootcamps.length === 1 ? " is-single" : ""}${bootcamps.length >= 3 ? " is-many" : ""}`}>
            {bootcamps.map((b) => {
              const full = b.status === "full";
              return (
                <li key={b.id} className="bootcamp-card">
                  {b.hasImage && (
                    <div className="bootcamp-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl(b)} alt="" loading="lazy" />
                    </div>
                  )}
                  <div className="bootcamp-body">
                    <span className={`bootcamp-status is-${b.status}`}>{STATUS_LABEL[b.status]}</span>
                    <h3>{b.title}</h3>
                    {b.summary && <p className="bootcamp-summary">{b.summary}</p>}

                    <dl className="bootcamp-facts">
                      <div>
                        <dt>Starts</dt>
                        <dd>{formatStartDate(b.startDate)}</dd>
                      </div>
                      {b.duration && (
                        <div>
                          <dt>Duration</dt>
                          <dd>{b.duration}</dd>
                        </div>
                      )}
                      {b.schedule && (
                        <div>
                          <dt>Classes</dt>
                          <dd>{b.schedule}</dd>
                        </div>
                      )}
                      {b.format && (
                        <div>
                          <dt>Where</dt>
                          <dd>{b.format}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="bootcamp-foot">
                      <p className="bootcamp-price">
                        <span>{formatPrice(b.price)}</span>
                        {b.originalPrice ? <s aria-label={`was ${formatPrice(b.originalPrice)}`}>{formatPrice(b.originalPrice)}</s> : null}
                      </p>
                      {full ? (
                        <span className="btn btn-outline is-disabled" aria-disabled="true">Fully booked</span>
                      ) : (
                        <a href={b.registerUrl} {...external} className="btn btn-primary" aria-label={`Register for ${b.title}`}>
                          Register <ArrowUpRight size={18} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
