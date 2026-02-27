import PagePlaceholder from '@/shared/components/PagePlaceholder/PagePlaceholder';
import { AddIcon } from '@chakra-ui/icons';

function ApplicationsPage() {
    return (
        <PagePlaceholder
            title="No applications yet"
            message="Start tracking your job applications to stay organized and never miss a follow-up."
            guidance="Add company, role, and application status to get AI-powered feedback on your match quality using our advanced vector search engine."
            action={{
                label: 'Add Application',
                icon: <AddIcon />,
                onClick: () => console.log('Add Application clicked'),
            }}
        />
    );
}

export default ApplicationsPage;
