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
import { useState } from 'react';
import { MdSave } from 'react-icons/md';

interface NewResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewResumeModal = ({ isOpen, onClose }: NewResumeModalProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string | number>('');
    const [customCategory, setCustomCategory] = useState('');
    const toast = useToast();

    const handleClose = () => {
        setSelectedCategory('');
        setCustomCategory('');
        onClose();
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
                            <Input placeholder="e.g. Software Engineer Resume 2026" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Resume File</FormLabel>
                            <Input
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
                                        _hover: {
                                            background: 'gray.200',
                                        }
                                    }
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

                        {selectedCategory === 'other' && (
                            <FormControl>
                                <FormLabel>Specify Category</FormLabel>
                                <Input
                                    placeholder="e.g. Freelance, Contract, Consulting"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                />
                            </FormControl>
                        )}

                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="Add notes about this resume version..."
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
                                title: 'Resume uploaded.',
                                description: "Your resume has been uploaded successfully.",
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
