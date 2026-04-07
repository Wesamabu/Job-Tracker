import { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Heading,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Link,
    Text,
    VStack,
    Divider,
    useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import authService from '@/features/auth/services/auth.service';

function RegisterPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<typeof form>>({});

    const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        const errs: Partial<typeof form> = {};
        if (!form.first_name.trim()) errs.first_name = 'First name is required.';
        if (!form.last_name.trim()) errs.last_name = 'Last name is required.';
        if (!form.email) errs.email = 'Email is required.';
        if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await authService.register(form);
            navigate('/dashboard', { replace: true });
        } catch (err: unknown) {
            const message =
                err instanceof Error && err.message.includes('409')
                    ? 'An account with this email already exists.'
                    : 'Registration failed. Please try again.';
            toast({
                title: 'Registration failed.',
                description: message,
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bgGradient="linear(to-br, blue.50, white, blue.100)"
            px={4}
            py={8}
        >
            <Box
                w="full"
                maxW="460px"
                bg="white"
                borderRadius="2xl"
                boxShadow="xl"
                p={{ base: 8, md: 10 }}
            >
                {/* Logo + Brand */}
                <Flex align="center" justify="center" gap={3} mb={8}>
                    <Image
                        src="/logo.jpeg"
                        alt="Job Tracker Logo"
                        boxSize="64px"
                        objectFit="contain"
                    />
                    <VStack align="start" spacing={0}>
                        <Heading size="lg" color="brand.600" lineHeight="1" letterSpacing="-0.5px">
                            Job Tracker
                        </Heading>
                        <Text fontSize="sm" color="teal.600" fontStyle="italic">
                            Smart Track. Better Career.
                        </Text>
                    </VStack>
                </Flex>

                <Divider mb={6} />

                <Heading size="md" mb={6} color="gray.700" textAlign="center">
                    Create your account
                </Heading>

                <Box as="form" onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!errors.first_name}>
                            <FormLabel fontSize="sm" color="gray.600">First Name</FormLabel>
                            <Input
                                value={form.first_name}
                                onChange={set('first_name')}
                                placeholder="Enter your first name"
                                focusBorderColor="brand.500"
                                size="lg"
                                borderRadius="lg"
                            />
                            <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.last_name}>
                            <FormLabel fontSize="sm" color="gray.600">Last Name</FormLabel>
                            <Input
                                value={form.last_name}
                                onChange={set('last_name')}
                                placeholder="Enter your last name"
                                focusBorderColor="brand.500"
                                size="lg"
                                borderRadius="lg"
                            />
                            <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel fontSize="sm" color="gray.600">Email address</FormLabel>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={set('email')}
                                placeholder="Enter your email"
                                focusBorderColor="brand.500"
                                size="lg"
                                borderRadius="lg"
                            />
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel fontSize="sm" color="gray.600">Password</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={set('password')}
                                    placeholder="Min. 8 characters"
                                    focusBorderColor="brand.500"
                                    borderRadius="lg"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                        variant="ghost"
                                        size="sm"
                                        color="gray.400"
                                        onClick={() => setShowPassword((v) => !v)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="brand"
                            width="full"
                            size="lg"
                            borderRadius="lg"
                            isLoading={loading}
                            loadingText="Creating account…"
                            mt={2}
                            bgGradient="linear(to-r, brand.500, brand.700)"
                            _hover={{ bgGradient: 'linear(to-r, brand.600, brand.800)' }}
                            _active={{ bgGradient: 'linear(to-r, brand.700, brand.900)' }}
                        >
                            Create Account
                        </Button>
                    </VStack>
                </Box>

                <Text textAlign="center" fontSize="sm" color="gray.500" mt={6}>
                    Already have an account?{' '}
                    <Link as={RouterLink} to="/login" color="brand.600" fontWeight="semibold">
                        Sign in
                    </Link>
                </Text>
            </Box>
        </Flex>
    );
}

export default RegisterPage;
