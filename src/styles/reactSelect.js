export const reactSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--cui-body-bg)',
    color: 'var(--cui-body-color)',
    borderColor: state.isFocused
      ? 'var(--cui-primary)'
      : 'var(--cui-border-color)',
    boxShadow: state.isFocused
      ? '0 0 0 .25rem rgba(var(--cui-primary-rgb), .25)'
      : 'none',
    '&:hover': {
      borderColor: 'var(--cui-primary)',
    },
  }),

  input: (base) => ({
    ...base,
    color: 'var(--cui-body-color)',
  }),

  singleValue: (base) => ({
    ...base,
    color: 'var(--cui-body-color)',
  }),

  placeholder: (base) => ({
    ...base,
    color: 'var(--cui-secondary-color)',
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--cui-body-bg)',
    border: '1px solid var(--cui-border-color)',
    zIndex: 9999,
  }),

  menuList: (base) => ({
    ...base,
    backgroundColor: 'var(--cui-body-bg)',
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--cui-primary)'
      : state.isFocused
        ? 'rgba(var(--cui-primary-rgb), .15)'
        : 'var(--cui-body-bg)',
    color: state.isSelected
      ? '#fff'
      : 'var(--cui-body-color)',
    cursor: 'pointer',
  }),

  clearIndicator: (base) => ({
    ...base,
    color: 'var(--cui-body-color)',
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--cui-body-color)',
  }),

  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--cui-border-color)',
  }),
}