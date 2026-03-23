import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Button,
    Text,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

export interface DropdownOption {
    id: string | number;
    label: string;
    value: string | number;
    secondaryText?: string;
    onClick?: () => void;
}

export interface DropdownAction {
    label: string;
    icon?: React.ReactElement;
    onClick: () => void;
    color?: string;
    hoverBg?: string;
    fontWeight?: string;
}

interface CustomDropdownProps {
    placeholder: string;
    options: DropdownOption[];
    value?: string | number;
    onChange?: (value: string | number) => void;
    action?: DropdownAction;
    isRequired?: boolean;
    variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
}

export function CustomDropdown({
    placeholder,
    options,
    value,
    onChange,
    action,
    variant = 'outline',
}: CustomDropdownProps) {
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <Menu matchWidth>
            <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                bg="white"
                width="100%"
                justifyContent="space-between"
                textAlign="left"
                variant={variant}
                display="flex"
            >
                {selectedOption ? selectedOption.label : placeholder}
            </MenuButton>
            <MenuList
                bg="white"
                minW="100%"
                w="100%"
                maxW="100%"
                maxH="250px"
                overflowY="auto"
                sx={{
                    minWidth: '100% !important',
                    width: '100% !important'
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.id}
                        justifyContent="space-between"
                        w="full"
                        onClick={() => {
                            if (option.onClick) {
                                option.onClick();
                            } else if (onChange) {
                                onChange(option.value);
                            }
                        }}
                    >
                        <Text>{option.label}</Text>
                        {option.secondaryText && (
                            <Text fontSize="xs" color="gray.600" ml={2}>
                                {option.secondaryText}
                            </Text>
                        )}
                    </MenuItem>
                ))}
                {action && (
                    <>
                        <MenuDivider />
                        <MenuItem
                            onClick={action.onClick}
                            color={action.color || 'brand.600'}
                            _hover={{ bg: action.hoverBg || 'brand.50' }}
                            fontWeight={action.fontWeight || 'medium'}
                        >
                            {action.icon}
                            {action.label}
                        </MenuItem>
                    </>
                )}
            </MenuList>
        </Menu>
    );
}
