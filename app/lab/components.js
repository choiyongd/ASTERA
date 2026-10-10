export function LabField({ id, label, hint, value, onChange, rows = 3 }) {
  return <div className="lab-field"><label htmlFor={id}>{label}</label>{hint && <p id={`${id}-hint`}>{hint}</p>}<textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={rows} maxLength={2000} aria-describedby={hint ? `${id}-hint` : undefined} /></div>;
}

export function AnswerChoices({ answers, value, onChange, label }) {
  return <fieldset className="lab-choice-field"><legend>{label}</legend><div className="lab-answer-choices">{answers.map((answer) => <label key={answer.id} className={`lab-answer ${value === answer.id ? "selected" : ""}`}><input type="radio" name={label} value={answer.id} checked={value === answer.id} onChange={() => onChange(answer.id)} /><span>{answer.label}</span></label>)}</div></fieldset>;
}

export function PlanetArt({ tone, size = 160 }) {
  // Code-native illustration for fictional worlds; not measured surface imagery.
  return <span className={`lab-planet-art ${tone}`} style={{ "--planet-size": `${size}px` }} aria-hidden="true"><span className="lab-planet-texture" /><span className="lab-planet-shade" /></span>;
}

export function InvestigationIcon({ name }) {
  return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === "water" ? <path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13Z M8 15a4 4 0 0 0 4 4" /> : name === "energy" ? <path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z" /> : name === "chemistry" ? <><path d="M9 2h6M10 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 9V2M8 15h8" /><circle cx="11" cy="18" r=".6" /></> : <><path d="M20 7A9 9 0 1 0 21 15M20 2v5h-5M12 7v5l3 2" /></>}</svg>;
}
