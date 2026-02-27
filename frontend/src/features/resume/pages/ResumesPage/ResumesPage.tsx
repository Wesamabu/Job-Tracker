import PagePlaceholder from '@/shared/components/PagePlaceholder/PagePlaceholder';
import { AttachmentIcon } from '@chakra-ui/icons';

function ResumesPage() {
    return (
        <PagePlaceholder
            title="No resumes yet"
            message="Upload your resume to get started with version management and skill tracking."
            guidance="Upload your resume to get AI-powered scoring, automatic skill extraction, and role-specific recommendations using our intelligent parsing engine."
            action={{
                label: 'Upload Resume',
                icon: <AttachmentIcon />,
                onClick: () => console.log('Upload Resume clicked'),
            }}
        />
    );
}

export default ResumesPage;
