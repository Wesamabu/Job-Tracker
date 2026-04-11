import {
    Box,
    Flex,
    Heading,
    Button,
    Container,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Tooltip,
    Image,
    Text,
    VStack,
    IconButton,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Stack,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService, { type CurrentUser } from '@/features/auth/services/auth.service';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        authService.getMe().then(setCurrentUser).catch(() => {});
    }, []);

    const fullName = currentUser
        ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
        : '';

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login', { replace: true });
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/applications', label: 'Applications' },
        { path: '/insights', label: 'Insights' },
        { path: '/resumes', label: 'Resumes' },
    ];

    const NavButton = ({ path, label, onClick }: { path: string; label: string; onClick?: () => void }) => (
        <Button
            as={RouterLink}
            to={path}
            variant="ghost"
            color={isActive(path) ? 'brand.600' : 'gray.800'}
            textDecoration={isActive(path) ? 'underline' : 'none'}
            textDecorationThickness="3px"
            textUnderlineOffset="6px"
            _hover={{ color: 'brand.600', textDecoration: 'underline', textDecorationThickness: '3px', textUnderlineOffset: '6px' }}
            onClick={onClick}
            w={{ base: 'full', md: 'auto' }}
            justifyContent={{ base: 'flex-start', md: 'center' }}
            fontSize={{ base: 'md', md: 'sm', lg: 'md' }}
            px={{ base: 4, md: 2, lg: 4 }}
        >
            {label}
        </Button>
    );

    return (
        <Box bg="gray.200" color="gray.700" px={4} py={3} boxShadow="md">
            <Container maxW="container.xl">
                <Flex justify="space-between" align="center">
                    {/* Logo */}
                    <Flex as={RouterLink} to="/dashboard" align="center" gap={{ base: 2, md: 2, lg: 3 }} cursor="pointer" _hover={{ opacity: 0.8 }}>
                        <Image src="/logo.jpeg" alt="Job Tracker Logo" boxSize={{ base: '32px', md: '36px', lg: '40px' }} objectFit="contain" />
                        <VStack align="start" spacing={0}>
                            <Heading size={{ base: 'md', md: 'md', lg: 'lg' }} color="brand.600" lineHeight="1">
                                Job Tracker
                            </Heading>
                            <Text
                                fontSize={{ base: 'xs', md: 'xs', lg: 'sm' }}
                                color="teal.600"
                                fontStyle="italic"
                                mt="-1"
                                display={{ base: 'none', sm: 'block' }}
                            >
                                Smart Track. Better Career.
                            </Text>
                        </VStack>
                    </Flex>

                    {/* Desktop Navigation */}
                    <Flex gap={{ md: 1, lg: 4 }} align="center" display={{ base: 'none', md: 'flex' }}>
                        {navItems.map((item) => (
                            <NavButton key={item.path} path={item.path} label={item.label} />
                        ))}
                        <Menu>
                            <Tooltip label={fullName} placement="bottom">
                                <MenuButton
                                    cursor="pointer"
                                    border="none"
                                    background="none"
                                    padding={0}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Avatar
                                        name={fullName}
                                        size="sm"
                                        bg="brand.400"
                                        _hover={{ bg: 'brand.500' }}
                                    />
                                </MenuButton>
                            </Tooltip>
                            <MenuList bg="white" color="black" borderColor="brand.200">
                                <MenuItem onClick={handleLogout}>
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>

                    {/* Mobile Menu Button */}
                    <Flex gap={2} align="center" display={{ base: 'flex', md: 'none' }}>
                        <Menu>
                            <Tooltip label={fullName} placement="bottom">
                                <MenuButton
                                    cursor="pointer"
                                    border="none"
                                    background="none"
                                    padding={0}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Avatar
                                        name={fullName}
                                        size="sm"
                                        bg="brand.400"
                                        _hover={{ bg: 'brand.500' }}
                                    />
                                </MenuButton>
                            </Tooltip>
                            <MenuList bg="white" color="black" borderColor="brand.200">
                                <MenuItem onClick={handleLogout}>
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        <IconButton
                            aria-label="Open menu"
                            icon={<HamburgerIcon />}
                            onClick={onOpen}
                            variant="ghost"
                            color="gray.800"
                            _hover={{ color: 'brand.600' }}
                        />
                    </Flex>
                </Flex>
            </Container>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
                    <DrawerBody>
                        <Stack spacing={4} mt={4}>
                            {navItems.map((item) => (
                                <NavButton key={item.path} path={item.path} label={item.label} onClick={onClose} />
                            ))}
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}

export default Navbar;
