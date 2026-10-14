import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <LoadingIndicator
        fullScreen
        message="Loading Lubricon CMS..."
        subMessage="Preparing administration console..."
        size="lg"
      />
    </div>
  );
}
