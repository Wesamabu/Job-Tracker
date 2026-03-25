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
    Text,
    useToast,
} from '@chakra-ui/react';
import { CustomDropdown } from '../CustomDropdown';
import { useRef, useState } from 'react';
import { MdSave } from 'react-icons/md';
import apiClient from '@/shared/lib/apiClient';

interface NewResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResumeAdded?: () => void;
}

export const NewResumeModal = ({ isOpen, onClose, onResumeAdded }: NewResumeModalProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string | number>('general');
    const [isSaving, setIsSaving] = useState(false);

    const titleRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const toast = useToast();

    const handleClose = () => {
        setSelectedCategory('general');
        if (fileRef.current) fileRef.current.value = '';
        onClose();
    };

    const handleSave = async () => {
        const title = titleRef.current?.value?.trim();
        const file = fileRef.current?.files?.[0];

        if (!title || !file) {
            toast({
                title: 'Missing required fields',
                description: 'Please enter a title and select a file.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', title);
        formData.append('category', String(selectedCategory) || 'general');

        setIsSaving(true);
        try {
            await apiClient.postForm('/resumes', formData);

            toast({
                title: 'Resume uploaded.',
                description: 'Your resume has been saved.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onResumeAdded?.();
            handleClose();
        } catch {
            toast({
                title: 'Upload failed',
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
                <ModalHeader>Upload New Resume</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Resume Title</FormLabel>
                            <Input ref={titleRef} placeholder="e.g. Software Engineer Resume 2026" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Resume File</FormLabel>
                            <Input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                pt={1}
                                sx={{
                                    '::file-selector-button': {
                                        height: 8,
                                        padding: 2,
                                        mr: 4,
                                        background: 'gray.100',
                                        border: '1px solid',
                                        borderColor: 'gray.300',
                                        borderRadius: 'md',
                                        fontSize: 'sm',
                                        fontWeight: 'medium',
                                        cursor: 'pointer',
                                        _hover: { background: 'gray.200' },
                                    },
                                }}
                            />
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Supported formats: PDF, DOC, DOCX (Max 5MB)
                            </Text>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Category</FormLabel>
                            <CustomDropdown
                                placeholder="Select category"
                                options={[
                                    { id: 'general', label: 'General', value: 'general' },
                                    { id: 'tech', label: 'Tech/Engineering', value: 'tech' },
                                    { id: 'management', label: 'Management', value: 'management' },
                                    { id: 'internship', label: 'Internship', value: 'internship' },
                                    { id: 'other', label: 'Other', value: 'other' },
                                ]}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                            />
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
