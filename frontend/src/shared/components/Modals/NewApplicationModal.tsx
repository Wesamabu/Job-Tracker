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
import { useState } from 'react';
import { MdSave } from 'react-icons/md';

interface NewApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumes: Array<{ id: number; name: string; format: string }>;
    onResumeModalOpen: () => void;
}

export const NewApplicationModal = ({
    isOpen,
    onClose,
    resumes,
    onResumeModalOpen,
}: NewApplicationModalProps) => {
    const [selectedStatus, setSelectedStatus] = useState<string | number>('');
    const [selectedResume, setSelectedResume] = useState<string | number>('');
    const toast = useToast();

    const handleClose = () => {
        setSelectedStatus('');
        setSelectedResume('');
        onClose();
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
                            <Input placeholder="e.g. Senior Software Engineer" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Company</FormLabel>
                            <Input placeholder="e.g. Google" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Location</FormLabel>
                            <Input placeholder="e.g. San Francisco, CA" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Date Applied</FormLabel>
                            <Input type="date" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Status</FormLabel>
                            <CustomDropdown
                                placeholder="Select status"
                                options={[
                                    { id: 'applied', label: 'Applied', value: 'applied' },
                                    { id: 'screening', label: 'Screening', value: 'screening' },
                                    { id: 'interview', label: 'Interview', value: 'interview' },
                                    { id: 'offer', label: 'Offer', value: 'offer' },
                                    { id: 'rejected', label: 'Rejected', value: 'rejected' },
                                    { id: 'accepted', label: 'Accepted', value: 'accepted' },
                                    { id: 'declined', label: 'Declined', value: 'declined' }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            />
                        </FormControl>

                        <FormControl isRequired w="full">
                            <FormLabel>Resume Used</FormLabel>
                            <CustomDropdown
                                placeholder="Select a resume"
                                options={resumes.map((resume) => ({
                                    id: resume.id,
                                    label: resume.name,
                                    value: resume.id,
                                    secondaryText: resume.format,
                                }))}
                                value={selectedResume}
                                onChange={setSelectedResume}
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
                            <FormLabel>Job URL</FormLabel>
                            <Input type="url" placeholder="https://..." />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Job Description</FormLabel>
                            <Textarea
                                placeholder="Paste the job description here..."
                                rows={4}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Salary Range</FormLabel>
                            <Input placeholder="e.g. $120k - $150k" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Notes</FormLabel>
                            <Textarea
                                placeholder="Add any relevant notes about this application..."
                                rows={3}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        leftIcon={<MdSave size="1.25em" />}
                        colorScheme="brand"
                        mr={3}
                        onClick={() => {
                            toast({
                                title: 'Application added.',
                                description: "Your job application has been created successfully.",
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                            });
                            handleClose();
                        }}
                    >
                        Save
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
