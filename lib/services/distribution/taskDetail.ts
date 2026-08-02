import { composeDistributionCopyPackage } from './composer';
import { buildDistributionDestinationSuggestion } from './destination';
import { buildDistributionPreflight, type DistributionPreflightResult } from './preflight';
import { scheduleDistributionTasks, type DistributionTaskScheduleItem } from './scheduler';
import type { DistributionTaskStatus } from './taskStateMachine';

export interface DistributionTaskDetailChannel {
  id: string;
  name: string;
  channelType: string;
  instructions: string | null;
  template: {
    titleTemplate: string | null;
    descriptionTemplate: string | null;
    maxTitleLength: number | null;
    maxDescriptionLength: number | null;
    requiredFields: string[];
  } | null;
}

export interface DistributionTaskDetail {
  task: {
    id: string;
    title: string;
    status: DistributionTaskStatus;
    priority: string;
    taskType: string;
    dueDate: string | null;
    instructions: string | null;
    notes: string | null;
    liveUrl: string | null;
    linkStatus: string | null;
    updatedAt: string | null;
  };
  project: {
    id: string;
    name: string;
    websiteUrl: string | null;
    description: string | null;
  };
  channel: DistributionTaskDetailChannel;
  target: {
    id: string;
    name: string;
    homepageUrl: string;
    submissionUrl: string | null;
    registrationUrl: string | null;
    pricingUrl: string | null;
    requiresAccount: boolean;
    requiresPayment: boolean;
    requiresCaptcha: boolean;
    requiresBacklink: boolean;
    editorialReview: boolean;
    expectedReviewDays: number | null;
    confidence: number;
  } | null;
  copyPackage: ReturnType<typeof composeDistributionCopyPackage>;
  preflight: DistributionPreflightResult;
  destination: ReturnType<typeof buildDistributionDestinationSuggestion>;
  package: {
    id: string;
    status: string;
    fields: Array<{
      key: string;
      label: string;
      value: string;
      required: boolean;
      characterLimit: number | null;
      sourceUrl: string | null;
    }>;
    assetRequirements: string[];
    missingAssets: string[];
    blockers: string[];
    warnings: string[];
    ready: boolean;
    approvedAt: string | null;
    updatedAt: string | null;
  } | null;
  events: Array<{
    id: string;
    eventType: string;
    fromStatus: string | null;
    toStatus: string | null;
    reason: string | null;
    createdAt: string;
  }>;
  reminders: Array<{
    id: string;
    reminderType: string;
    scheduledAt: string;
    status: string;
  }>;
  nextSuggestions: DistributionTaskScheduleItem[];
  recentResult: {
    liveUrl: string | null;
    linkStatus: string | null;
    notes: string | null;
    checkedAt: string | null;
  } | null;
}

export function buildDistributionTaskDetail(input: {
  task: DistributionTaskDetail['task'];
  project: DistributionTaskDetail['project'];
  channel: DistributionTaskDetailChannel;
  target?: DistributionTaskDetail['target'];
  package?: DistributionTaskDetail['package'];
  events?: DistributionTaskDetail['events'];
  reminders?: DistributionTaskDetail['reminders'];
  recentResult: DistributionTaskDetail['recentResult'];
  queue: Array<{
    id: string;
    title: string;
    status: DistributionTaskStatus;
    priority: string;
    dueDate: string | null;
    channelName: string;
    channelType: string;
  }>;
}): DistributionTaskDetail {
  const copyPackage = composeDistributionCopyPackage({
    productName: input.project.name,
    projectDescription: input.project.description,
    projectUrl: input.project.websiteUrl,
    channelName: input.target?.name || input.channel.name,
    channelType: input.channel.channelType,
    template: input.channel.template,
    proofPoint: input.project.description || `${input.project.name} is available on the official website.`,
    audience: input.channel.channelType === 'community' ? 'community readers' : 'the intended audience',
    valueProp:
      input.channel.channelType === 'alternative'
        ? `compare ${input.project.name} clearly`
        : `share ${input.project.name}`,
  });
  const preflight = buildDistributionPreflight({
    copyPackage,
    projectUrl: input.project.websiteUrl,
    projectDescription: input.project.description,
    channelName: input.target?.name || input.channel.name,
    channelType: input.channel.channelType,
  });
  const destination = buildDistributionDestinationSuggestion({
    projectUrl: input.project.websiteUrl,
    channelKey: input.target?.id || input.channel.id,
    channelName: input.target?.name || input.channel.name,
    projectName: input.project.name,
    campaign: `${input.project.name}-${input.channel.name}`,
    content: input.task.title,
  });
  const nextSuggestions = scheduleDistributionTasks(input.queue).slice(0, 3);

  return {
    task: input.task,
    project: input.project,
    channel: input.channel,
    target: input.target || null,
    copyPackage,
    preflight,
    destination,
    package: input.package || null,
    events: input.events || [],
    reminders: input.reminders || [],
    nextSuggestions,
    recentResult: input.recentResult,
  };
}
