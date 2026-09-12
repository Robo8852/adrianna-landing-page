"use client";

import { Fragment } from "react";
import { GoldRule } from "@/components/primitives/GoldRule";
import { IlluminatedMarker } from "@/components/primitives/IlluminatedMarker";

const bodyStyle = {
  margin: 0,
  fontFamily: "var(--font-eb-garamond), Georgia, serif",
  fontSize: "1.1rem",
  lineHeight: 1.75,
  color: "var(--parchment)",
} as const;

const emphasisStyle = {
  ...bodyStyle,
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontStyle: "italic",
  fontSize: "1.45rem",
  lineHeight: 1.5,
  textAlign: "center",
} as const;

const openingParagraphs = [
  "We are a community of traditional and conservative faith counselors, mentors, psychotherapists, coaches, spiritual directors, educators, and spiritual companions committed to helping individuals understand themselves more deeply in the light of the Apostolic faith and gospel.",
  "Rather than separating faith from science, we seek to integrate the best of psychology and neuroscience with the timeless wisdom of the Apostolic intellectual and spiritual tradition. We believe that understanding the mind is valuable, but understanding the soul is indispensable. Psychology can illuminate the mechanisms of human behavior, while the Gospel reveals the ultimate purpose of the human person.",
  "Just as we have an altar in our Church, and an altar in our homes, we must also have an altar within.",
];

const litany = [
  "An interior altar.",
  "A place where Christ dwells.",
  "A place of order, beauty, hierarchy, and structure.",
  "A place where there is offering.",
  "A place where we receive Communion.",
];

const litanyClose = ["Relationally.", "Sacramentally.", "Truthfully."];

const meaningParagraphs = [
  "The altar has always been the place where heaven and earth meet. It is where the visible and invisible converge, where the ordinary is taken up into the extraordinary, where sacrifice becomes communion, and where the human person is invited into deeper participation with God.",
];

const formationParagraphs = [
  "Each of us carries an inner sanctuary that is constantly being formed by what we love, what we contemplate, what we worship, and what we repeatedly offer our attention to. The question is not whether we possess an altar, but what has been placed upon it.",
  "To cultivate the altar within is to restore right order to the soul. It is to allow truth to govern perception, virtue to shape character, beauty to awaken desire, and love to rightly orient the will. It is the quiet work of becoming integrated, where intellect, reason, emotion, conscience, and desire are no longer fragmented, but gradually ordered toward what is true, good, and beautiful.",
];

const closingParagraphs = [
  "We take what is profound, sacramental, incarnational, mysteriously alive, and translate it into intelligible structures so that the mind can approach it, without draining it of its mystery.",
  "The Altar Within exists because true formation begins from the inside out. Before we transform our relationships, our families, our communities, or the culture around us, something deeper must first be consecrated.",
];

function Column({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: "34rem",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}

export default function A0() {
  return (
    <section
      style={{
        padding: "8rem 1.5rem 5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3rem",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontWeight: 300,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          color: "var(--parchment)",
          textAlign: "center",
        }}
      >
        Why The Altar Within?
      </h1>
      <GoldRule width="8rem" />

      <Column>
        {openingParagraphs.map((p, i) => (
          <p key={i} style={bodyStyle}>
            {p}
          </p>
        ))}
      </Column>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6rem",
          padding: "1rem 0",
        }}
      >
        {litany.map((line) => (
          <p key={line} style={emphasisStyle}>
            {line}
          </p>
        ))}
        <p
          style={{
            margin: "1.25rem 0 0",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.85rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--gold-warm)",
            textAlign: "center",
          }}
        >
          {litanyClose.map((word, i) => (
            <Fragment key={word}>
              {i > 0 ? (
                <span aria-hidden="true" style={{ color: "var(--gold)" }}>
                  {"  ·  "}
                </span>
              ) : null}
              {word}
            </Fragment>
          ))}
        </p>
      </div>

      <IlluminatedMarker variant="plus" />

      <Column>
        {meaningParagraphs.map((p, i) => (
          <p key={i} style={bodyStyle}>
            {p}
          </p>
        ))}
        <p style={{ ...emphasisStyle, margin: "0.5rem 0" }}>
          The interior life is no different.
        </p>
        {formationParagraphs.map((p, i) => (
          <p key={i} style={bodyStyle}>
            {p}
          </p>
        ))}
      </Column>

      <IlluminatedMarker variant="triplet" />

      <Column>
        <p style={{ ...emphasisStyle, margin: "0.5rem 0" }}>
          We do not reduce the faith into clinical language.
        </p>
        {closingParagraphs.map((p, i) => (
          <p key={i} style={bodyStyle}>
            {p}
          </p>
        ))}
      </Column>
    </section>
  );
}
