<script setup lang="ts">
const { state, submitInterview, submitReject } = useReviewActions()
const minDate = new Date()
</script>

<template>
  <Dialog v-model:visible="state.interview.visible" modal header="Schedule interview" :style="{ width: '26rem' }" :closable="!state.busy">
    <p class="mb-4 text-sm text-muted">{{ state.interview.app?.applicant.fullName }} · {{ state.interview.app?.reference }}</p>
    <div class="space-y-4">
      <AppField id="iv-at" label="Date and time" required>
        <DatePicker v-model="state.interview.at" input-id="iv-at" show-time hour-format="24" :min-date="minDate" show-icon fluid placeholder="Select date and time" />
      </AppField>
      <AppField id="iv-note" label="Note to applicant" hint="Optional: location, link or preparation details.">
        <Textarea id="iv-note" v-model="state.interview.note" rows="3" fluid />
      </AppField>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text :disabled="state.busy" @click="state.interview.visible = false" />
      <Button label="Schedule" icon="pi pi-calendar" :disabled="!state.interview.at" :loading="state.busy" @click="submitInterview" />
    </template>
  </Dialog>

  <Dialog v-model:visible="state.reject.visible" modal header="Reject application" :style="{ width: '26rem' }" :closable="!state.busy">
    <p class="mb-4 text-sm text-muted">
      Reject {{ state.reject.app?.applicant.fullName }} ({{ state.reject.app?.reference }})? This is recorded in the application timeline.
    </p>
    <AppField id="rj-note" label="Reason (optional)" hint="Stored with the decision.">
      <Textarea id="rj-note" v-model="state.reject.note" rows="3" fluid />
    </AppField>
    <template #footer>
      <Button label="Cancel" severity="secondary" text :disabled="state.busy" @click="state.reject.visible = false" />
      <Button label="Reject" icon="pi pi-times" severity="danger" :loading="state.busy" @click="submitReject" />
    </template>
  </Dialog>
</template>
