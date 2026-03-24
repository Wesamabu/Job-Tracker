import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    VStack,
    useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { CustomDropdown } from '../CustomDropdown';
import { useRef, useState } from 'react';
import { MdSave } from 'react-icons/md';
import applicationsService from '@/features/applications/services/applications.service';

interface NewApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResumeModalOpen: () => void;
    onApplicationAdded?: () => void;
}

export const NewApplicationModal = ({
    isOpen,
    onClose,
    onResumeModalOpen,
    onApplicationAdded,
}: NewApplicationModalProps) => {
    const [selectedStatus, setSelectedStatus] = useState<string | number>('applied');
    const [selectedResumeId, setSelectedResumeId] = useState<string | number>('');
    const [isSaving, setIsSaving] = useState(false);

    const jobTitleRef = useRef<HTMLInputElement>(null);
    const companyRef = useRef<HTMLInputElement>(null);
    const locationRef = useRef<HTMLInputElement>(null);
    const dateRef = useRef<HTMLInputElement>(null);
    const notesRef = useRef<HTMLTextAreaElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const toast = useToast();

    const handleClose = () => {
        setSelectedStatus('applied');
        setSelectedResumeId('');
        onClose();
    };

    const handleSave = async () => {
        const jobTitle = jobTitleRef.current?.value?.trim();
        const company = companyRef.current?.value?.trim();
        const appliedDate = dateRef.current?.value;

        if (!jobTitle || !company || !appliedDate) {
            toast({
                title: 'Missing required fields',
                description: 'Please fill in Job Title, Company, and Date Applied.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSaving(true);
        try {
            await applicationsService.create({
                jobTitle,
                company,
                location: locationRef.current?.value?.trim() || undefined,
                status: String(selectedStatus) || 'applied',
                appliedDate,
                description: descriptionRef.current?.value?.trim() || undefined,
                notes: notesRef.current?.value?.trim() || undefined,
                resumeId: selectedResumeId ? Number(selectedResumeId) : undefined,
            } as any);

            toast({
                title: 'Application added.',
                description: 'Your job application has been saved.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onApplicationAdded?.();
            handleClose();
        } catch {
            toast({
                title: 'Failed to save application',
                description: 'Something went wrong. Please try again.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size={{ base: 'full', md: 'xl' }}>
            <ModalOverlay />
            <ModalContent mx={{ base: 0, md: 4 }}>
                <ModalHeader>Add New Application</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Job Title</FormLabel>
                            <Input ref={jobTitleRef} placeholder="e.g. Senior Software Engineer" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Company</FormLabel>
                            <Input ref={companyRef} placeholder="e.g. Google" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Location</FormLabel>
                            <Input ref={locationRef} placeholder="e.g. San Francisco, CA" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Date Applied</FormLabel>
                            <Input ref={dateRef} type="date" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Status</FormLabel>
                            <CustomDropdown
                                placeholder="Select status"
                                options={[
                                    { id: 'applied', label: 'Applied', value: 'applied' },
                                    { id: 'screening', label: 'Screening', value: 'screening' },
                                    { id: 'interviewing', label: 'Interviewing', value: 'interviewing' },
                                    { id: 'offered', label: 'Offered', value: 'offered' },
                                    { id: 'rejected', label: 'Rejected', value: 'rejected' },
                                    { id: 'accepted', label: 'Accepted', value: 'accepted' },
                                    { id: 'declined', label: 'Declined', value: 'declined' },
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            />
                        </FormControl>

                        <FormControl w="full">
                            <FormLabel>Resume Used (optional)</FormLabel>
                            <CustomDropdown
                                placeholder="Select a resume (optional)"
                                options={[]}
                                value={selectedResumeId}
                                onChange={setSelectedResumeId}
                                action={{
                                    label: 'Upload New Resume',
                                    icon: <AddIcon mr={2} />,
                                    onClick: onResumeModalOpen,
                                    color: 'brand.600',
                                    hoverBg: 'brand.50',
                                    fontWeight: 'medium',
                                }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Job Description</FormLabel>
                            <Textarea ref={descriptionRef} placeholder="Paste the job description here..." rows={4} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Notes</FormLabel>
                            <Textarea ref={notesRef} placeholder="Add any relevant notes..." rows={3} />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        leftIcon={<MdSave size="1.25em" />}
                        colorScheme="brand"
                        mr={3}
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        Save
                    </Button>
                    <Button variant="outline" onClick={handleClose} isDisabled={isSaving}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
