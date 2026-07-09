import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripVertical, Bell } from 'lucide-react';
import type { ItineraryStep } from '../../features/itinerary/itinerary';
import { useStepReminder } from '../../features/notifications/useStepReminder';
import type { NotificationSupport } from '../../features/notifications/useGateAlerts';
import { fmt } from '../../i18n/answers';
import type { ItineraryStrings } from '../../i18n/ui';

interface ItineraryStepRowProps {
  id: string;
  step: ItineraryStep;
  label: string;
  timeLabel: string;
  isDone: boolean;
  isCurrent: boolean;
  permission: NotificationSupport;
  strings: ItineraryStrings;
}

export function ItineraryStepRow({
  id,
  step,
  label,
  timeLabel,
  isDone,
  isCurrent,
  permission,
  strings,
}: ItineraryStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const reminder = useStepReminder(permission, step.time, strings.alertTitle, fmt(strings.alertBody, { gate: label }));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cls = `itinerary__step${isDone ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}${isDragging ? ' is-dragging' : ''}`;

  return (
    <li ref={setNodeRef} style={style} className={cls}>
      <button
        type="button"
        className="itinerary__drag-handle"
        aria-label={fmt(strings.dragHandleLabel, { step: label })}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>
      <span className="itinerary__marker" aria-hidden="true">
        {isDone && !isCurrent ? <Check size={11} strokeWidth={3} /> : <span className="itinerary__marker-dot" />}
      </span>
      <span className="itinerary__time tabular">{timeLabel}</span>
      <span className="itinerary__label">{label}</span>
      {permission !== 'unsupported' ? (
        <span className="itinerary__row-actions">
          <button
            type="button"
            className="itinerary__reminder-btn"
            aria-pressed={reminder.armed}
            aria-label={fmt(strings.reminderToggle, { step: label })}
            title={reminder.armed ? fmt(strings.reminderOn, { step: label }) : fmt(strings.reminderToggle, { step: label })}
            onClick={reminder.toggle}
          >
            <Bell size={13} aria-hidden="true" />
          </button>
        </span>
      ) : null}
    </li>
  );
}
