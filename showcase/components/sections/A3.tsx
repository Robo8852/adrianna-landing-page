"use client";

import { Fragment } from "react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { PillarPanel } from "@/components/composites/PillarPanel";
import { IlluminatedMarker } from "@/components/primitives/IlluminatedMarker";
import type { MicroSigilMotif } from "@/components/primitives/MicroSigil";

const practiceParagraphs = [
  "I facilitate and assist beings from all walks of faith in demystifying psychospiritual psychology and guiding their journey toward integration through neuroscience and embodied awareness.",
  "Adrianna Naílah is a distinguished Clinical Psychotherapist (USA) with an extended background in neuropsychology and over a decade of experience bridging applied neuroscience, psychology, and spirituality. She holds an MSc in Transpersonal Psychology, Spirituality, and Consciousness (UK), along with an accreditation in psychedelic-assisted psychotherapy.",
  "Her therapeutic approach is integrative, challenging, and cutting-edge — weaving together a diverse array of modalities including Dialectical Behavioral Therapy (DBT), Acceptance and Commitment Therapy (ACT), Internal Family Systems (IFS), and Rational Emotive Behavioral Therapy (REBT). Adrianna's work is guided by a deep commitment to demystifying behaviors and patterns while offering tailored, multi-dimensional care for individuals navigating affective mood disorders and psychiatric disharmonies.",
  "With extensive expertise in treating Post-Traumatic Stress Disorder (PTSD) and Complex PTSD (CPTSD), Adrianna's method transcends traditional therapeutic boundaries. She brings a unique psychospiritual lens to trauma recovery, focusing on Post-Traumatic Growth, resilience, memory reconsolidation, and psychological flexibility — emphasizing profound personal transformation. Her mastery of integrative, trauma-informed modalities allows her to provide a sophisticated fusion of neurobiological insight and psychospiritual depth, positioning her as a thought leader in trauma-informed and resilience-focused psychotherapy.",
  "Known for her unconventional and deeply personalized approach, Adrianna excels in navigating complex clinical cases — often stepping in where traditional methods may falter. Her success lies in her capacity to engage the full spectrum of the human experience (body, mind, and spirit), cultivating lasting transformation and profound insight. By artfully blending scientific precision with spiritual exploration, she crafts an integrative pathway that is both cutting-edge and grounded in a deep understanding of human nature and consciousness.",
  "Her work extends into the realm of Conscious Leadership Coaching, empowering creative executives, professionals, and entrepreneurs to harness both self-leadership and collective leadership capacities. With a focus on fostering daring, optimizing flow, and creating expansive impact, her coaching equips leaders to thrive in both their professional and personal lives.",
  "Through this holistic lens, Adrianna builds leaders who not only navigate the complexities of modern life with intelligence and grace, but also drive meaningful change in the world.",
];

const pillarsIntro =
  "As a psychotherapist, my approach rests on five core pillars that intertwine the intellectual, the mystical, and the profoundly human: Compassion, Love, Resilience, Integrity, and Partnership. These elements create a transformative journey where science and soul meet — sparking healing that is both deep and expansive.";

const pillarPanels: { motif: MicroSigilMotif; name: string; body: string }[] = [
  {
    motif: "vessel",
    name: "Compassion",
    body:
      "Compassion is more than a warm embrace; it's an active, intelligent force that rewires our brains for connection. In therapy, compassion means understanding the nuanced dance between suffering and the self. Neuroscience shows that when we experience compassion, we activate the brain's healing networks, creating space for emotional rewiring. In this way, compassion becomes both a biological and spiritual catalyst for change — a tender superpower that gently dismantles shame and makes room for authentic growth.",
  },
  {
    motif: "vesica",
    name: "Love",
    body:
      "Let's geek out on love for a second: this is not a fluffy feeling, but a potent, essential force that reshapes how we perceive the world. Love is at the root of neuroplasticity — it unlocks the brain's potential to heal and evolve. In my work, love is about cultivating a radical space where clients feel safe to unravel, get messy, and be challenged. Love is fierce and boundless, inviting beings to proactively delve into the powerful realization that they are infinitely more than their painful circumstances.",
  },
  {
    motif: "vine",
    name: "Resilience",
    body:
      "Resilience isn't about bouncing back — it's about expanding forward, evolving in ways we never imagined. Think of resilience as a complex, dynamic system embedded in our neurobiology and spirit. It's the human capacity not just to survive but to thrive in the face of adversity. Resilience isn't merely a trait; it's a skill that can be nurtured and developed. Together, we tap into your ability to turn adversity into wisdom — to rise not just from the ashes, but with them — and live free through authenticity and clear vision.",
  },
  {
    motif: "plumb-line",
    name: "Integrity",
    body:
      "Integrity is essential — the thread that binds thought, action, and purpose into one cohesive flow. In therapy, integrity means staying true to your inner compass: no more fragmented selves or masks. It's about getting intellectually curious about what it means to live in alignment. Integrity builds trust, not just between therapist and client but within the self. It's the neural circuitry of truth, where the cognitive and emotional come together to create a life that feels whole, unshakable, and transparent — rooted in respect for our core values and principles.",
  },
  {
    motif: "interlocking-lobes",
    name: "Partnership & Humor",
    body:
      "Let's be real: healing is not a solo mission. Partnership is where the magic happens — where we co-create your path forward. In therapy, I'm not the expert \"fixing\" you; instead, we're two explorers navigating internal systems and learned patterns, using both science and intuition to chart the territory. This partnership isn't passive — it's proactive, dynamic, and playful. Together, we form an intellectual and emotional powerhouse capable of navigating the most complex landscapes of your psyche. We're co-pilots in the art and science of decoding the thresholds we find along the way. Therapy is a partnership: each client has access to me even between sessions when needed. It's about me doing my part and you proactively engaging in the process.",
  },
];

const pillarsClosing =
  "Each of these pillars isn't just a concept — they're living, breathing forces we activate together in therapy. It's like hacking the system of the mind while plugging into the heart, combining the sacred and the scientific to help you integrate in the most intelligent, loving, and joyful way possible.";

const paragraphStyle = {
  margin: 0,
  fontFamily: "var(--font-eb-garamond), Georgia, serif",
  fontSize: "1.1rem",
  lineHeight: 1.75,
  color: "var(--parchment)",
} as const;

export default function A3() {
  // Render markers after every second paragraph (after indices 1, 3, 5).
  // With 7 paragraphs (last index 6), final marker lands after index 5 — no trailing marker.
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
      <SectionHeading size="1.75rem">Her Practice</SectionHeading>

      <div
        style={{
          maxWidth: "34rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {practiceParagraphs.map((para, i) => {
          const isLast = i === practiceParagraphs.length - 1;
          const showMarker = i % 2 === 1 && !isLast;
          return (
            <Fragment key={i}>
              <p style={paragraphStyle}>{para}</p>
              {showMarker ? (
                <IlluminatedMarker variant="plus" />
              ) : null}
            </Fragment>
          );
        })}
      </div>

      <div id="pillars" style={{ marginTop: "4rem", width: "100%" }}>
        <SectionHeading as="h3" size="2.5rem">
          The Pillars and Values of My Service
        </SectionHeading>
      </div>

      <p
        style={{
          ...paragraphStyle,
          maxWidth: "34rem",
          textAlign: "center",
        }}
      >
        {pillarsIntro}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6rem",
          width: "100%",
        }}
      >
        {pillarPanels.map((p) => (
          <PillarPanel
            key={p.name}
            motif={p.motif}
            name={p.name}
            body={p.body}
          />
        ))}
      </div>

      <IlluminatedMarker variant="plus" />

      <p
        style={{
          ...paragraphStyle,
          maxWidth: "34rem",
          textAlign: "center",
        }}
      >
        {pillarsClosing}
      </p>
    </section>
  );
}
