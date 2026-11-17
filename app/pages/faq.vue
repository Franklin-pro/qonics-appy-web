<script setup lang="ts">
useHead({ title: 'FAQ | Qonics Inc.' })
const faqs = [
  { q: 'Who can apply?', a: 'University students and recent graduates, typically in computer science, software engineering, electronics, or related fields.' },
  { q: 'When can I apply?', a: 'Applications are open throughout the year. They only close if our administrators pause intake, in which case a message is shown on the Apply page.' },
  { q: 'Which departments are available?', a: 'Qonics offers two departments: Software Development and Internet of Things (IoT). You choose one department and one specialization per application.' },
  { q: 'Which documents do I need?', a: 'University applicants must upload an academic transcript and may add a diploma certificate. High school applicants need no transcript. A CV/resume, supporting certificates and a cover letter are optional for everyone. Files must be PDF, DOC or DOCX, up to 5 MB each.' },
  { q: 'How do I track my application?', a: 'Sign in to your applicant portal to see the status, timeline and notifications for every application.' },
  { q: 'Can I apply to more than one specialization?', a: 'Yes. Each application is separate, so you can apply to different specializations. Please tailor each one.' }
]
</script>

<template>
  <div>
    <PageBanner eyebrow="FAQ" title="Frequently asked questions" lead="Quick answers about our internship program and the application process." />
    <section class="container-x max-w-3xl py-12">
      <Accordion value="0">
        <AccordionPanel v-for="(f, i) in faqs" :key="f.q" :value="String(i)">
          <AccordionHeader>{{ f.q }}</AccordionHeader>
          <AccordionContent><p class="text-sm leading-relaxed text-muted">{{ f.a }}</p></AccordionContent>
        </AccordionPanel>
      </Accordion>
    </section>
    <ApplyCta />
  </div>
</template>
