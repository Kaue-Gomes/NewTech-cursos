export default function Card({ context, children, action, className = "" }) {
  return (
    <article className={`ui-card ${className}`.trim()}>
      {context ? <div className="ui-card__context">{context}</div> : null}
      <div className="ui-card__body">{children}</div>
      {action ? <div className="ui-card__action">{action}</div> : null}
    </article>
  );
}
