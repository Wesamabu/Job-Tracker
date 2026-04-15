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
    HStack,
    Divider,
    Text,
    InputGroup,
    InputRightElement,
    Box,
    Icon,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { MdLink, MdSave } from 'react-icons/md';
import { CustomDropdown } from '../CustomDropdown';
import { useRef, useState, useEffect } from 'react';
import applicationsService from '@/features/applications/services/applications.service';
import apiClient from '@/shared/lib/apiClient';

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
    const [resumeOptions, setResumeOptions] = useState<{ id: string | number; label: string; value: string | number }[]>([]);

    const [jobUrl, setJobUrl] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            apiClient.get<{ items: { id: number; title?: string; name?: string }[] }>('/resumes')
                .then((data) => {
                    setResumeOptions(data.items.map((r) => ({ id: r.id, label: r.title || r.name || 'Untitled', value: r.id })));
                })
                .catch(() => setResumeOptions([]));
        }
    }, [isOpen]);

    const locationRef = useRef<HTMLInputElement>(null);
    const dateRef = useRef<HTMLInputElement>(null);
    const notesRef = useRef<HTMLTextAreaElement>(null);

    const toast = useToast();

    const handleParseUrl = async () => {
        const trimmed = jobUrl.trim();
        if (!trimmed) return;
        setIsParsing(true);
        setParseError('');
        try {
            const data = await applicationsService.parseJobUrl(trimmed);
            if (data.role) setJobTitle(data.role);
            if (data.company_name) setCompany(data.company_name);
            if (data.job_description) setDescription(data.job_description);
            toast({
                title: 'Job details parsed',
                description: 'Fields have been auto-filled. Review and adjust as needed.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch {
            setParseError('Could not extract details from this URL. Try a direct company career page, or fill in the fields below manually.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleClose = () => {
        setSelectedStatus('applied');
        setSelectedResumeId('');
        setResumeOptions([]);
        setJobUrl('');
        setJobTitle('');
        setCompany('');
        setDescription('');
        setParseError('');
        onClose();
    };

    const handleSave = async () => {
        const appliedDate = dateRef.current?.value;

        if (!jobTitle.trim() || !company.trim() || !appliedDate) {
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
                jobTitle: jobTitle.trim(),
                company: company.trim(),
                location: locationRef.current?.value?.trim() || undefined,
                status: String(selectedStatus) || 'applied',
                appliedDate,
                description: description.trim() || undefined,
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
                    <VStack spacing={4} w="full">

                        {/* Parsing Job URL */}
                        <Box
                            w="full"
                            p={4}
                            bg="brand.50"
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor="brand.200"
                        >
                            <Text fontWeight="700" fontSize="sm" color="brand.700" mb={3}>
                                Auto-fill from Job Posting URL
                            </Text>
                            <Text fontSize="xs" color="brand.600" mb={3}>
                                Paste a link to the job posting and we'll fill in the title, company, and description for you.
                            </Text>
                            <InputGroup size="md">
                                <Input
                                    value={jobUrl}
                                    onChange={(e) => { setJobUrl(e.target.value); setParseError(''); }}
                                    placeholder="https://careers.company.com/job/..."
                                    bg="white"
                                    borderColor="brand.200"
                                    _hover={{ borderColor: 'brand.400' }}
                                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                                    pr="6rem"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleParseUrl(); }}
                                />
                                <InputRightElement width="6rem">
                                    <Button
                                        h="1.75rem"
                                        size="sm"
                                        colorScheme="brand"
                                        leftIcon={<Icon as={MdLink} />}
                                        onClick={handleParseUrl}
                                        isLoading={isParsing}
                                        loadingText="Filling…"
                                        isDisabled={!jobUrl.trim()}
                                        fontSize="xs"
                                        px={3}
                                    >
                                        Fill
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            {parseError ? (
                                <Text fontSize="xs" color="red.500" mt={2}>
                                    {parseError}
                                </Text>
                            ) : (
                                <Text fontSize="xs" color="gray.500" mt={2}>
                                    Works on most company career pages. LinkedIn and Indeed block scraping.
                                </Text>
                            )}
                        </Box>

                        <HStack w="full" align="center">
                            <Divider />
                            <Text fontSize="xs" color="gray.400" whiteSpace="nowrap" px={2}>details</Text>
                            <Divider />
                        </HStack>

                        <FormControl isRequired>
                            <FormLabel>Job Title</FormLabel>
                            <Input
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Company</FormLabel>
                            <Input
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. Google"
                            />
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
                                options={resumeOptions}
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
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                rows={4}
                            />
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
                        isDisabled={isSaving}
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
