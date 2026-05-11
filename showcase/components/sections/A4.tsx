"use client";

import { SectionHeading } from "@/components/primitives/SectionHeading";
import { GoldRule } from "@/components/primitives/GoldRule";
import { CredentialRow } from "@/components/composites/CredentialRow";

const credentials = [
  {
    numeral: "I",
    title: "Bachelor's in Psychology",
    year: "2008–2012",
    institution: "The Catholic University of America, Washington, D.C., USA",
  },
  {
    numeral: "II",
    title: "Master's in Neuropsychology",
    year: "2012–2014",
    institution: "The Catholic University of America, Washington, D.C., USA",
  },
  {
    numeral: "III",
    title: "MSc in Transpersonal Psychology, Spirituality & Consciousness",
    year: "2014–2016",
    institution: "Liverpool John Moores University, UK",
    specialization: "Specialization in the Neuroscience of Emotions and Trauma",
  },
  {
    numeral: "IV",
    title: "Certified Internal Family Systems (IFS) Practitioner",
    year: "2017",
    institution: "IFS Institute",
  },
  {
    numeral: "V",
    title: "Certified in Contextual Therapies — CBT, DBT, ACT",
    year: "2017–2023",
    institution: "Beck Institute for Cognitive Behavioral Therapy",
  },
  {
    numeral: "VI",
    title: "Accredited Psychedelic-Assisted Psychotherapist",
    year: "2018",
    institution: "Multidisciplinary Association for Psychedelic Studies (MAPS)",
  },
  {
    numeral: "VII",
    title: "Transformational Recovery Coach",
    year: "2019",
    institution: "Being True To You (BTTY)",
  },
  {
    numeral: "VIII",
    title: "Certified Mindfulness Instructor",
    year: "2020",
    institution: "Centre for Mindfulness Research and Practice, University of Galway",
  },
  {
    numeral: "IX",
    title: "Somatic Experiencing Training — Trauma Reconsolidation",
    year: "2021–Present",
    institution: "Somatic Experiencing International",
  },
];

export default function A4() {
  return (
    <section
      style={{
        padding: "5rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3rem",
      }}
    >
      <SectionHeading size="1.75rem">Credentials</SectionHeading>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.78rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--gold-warm)",
          }}
        >
          Certificate Number — #241254106
        </p>
        <GoldRule width="6rem" />
      </div>

      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          maxWidth: "40rem",
          width: "100%",
          textAlign: "left",
        }}
      >
        {credentials.map((c) => (
          <CredentialRow
            key={c.numeral}
            numeral={c.numeral}
            title={c.title}
            year={c.year}
            institution={c.institution}
            specialization={c.specialization}
          />
        ))}
      </ol>
    </section>
  );
}
