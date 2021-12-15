// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Интерфейс стандарта ERC-20.
 */
interface IERC20 {
    /**
     * @notice Возвращает имя токена.
     * @return Имя.
     */
    function name() external view returns (string memory);

    /**
     * @notice Возвращает символ токена.
     * @return Символ.
     */
    function symbol() external view returns (string memory);

    /**
     * @notice Возвращает десятичный разряд токена.
     * @return Десятичный разряд.
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Возвращает количество существующих токенов.
     * @return Количество существующих токенов.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Возвращает количество токенов, принадлежащих `account`.
     * @return Количество токенов.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Перемещает токены `amount` со счета вызывающего аккунта в `recipient`.
     * @param recipient Получатель.
     * @param amount Количество токенов.
     * @return Логическое значение, указывающее, была ли операция выполнена успешно.
     */
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    /**
     * @dev Возвращает оставшееся количество токенов, которые разрешено
     * потратить `spender` от имени `owner`.
     * @param owner Владелец.
     * @param spender Тратящий аккаунт.
     * @return Количество токенов.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev Устанавливает количество токенов, которые разрешено
     * потратить `spender` от имени `owner`.
     * @param spender Тратящий аккаунт.
     * @param amount Количество токенов.
     * @return Логическое значение, указывающее, была ли операция выполнена успешно.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Перемещает токены от `sender` к `recipient`.
     * @param sender Отправитель.
     * @param recipient Получатель.
     * @param amount Количество токенов.
     * @return Логическое значение, указывающее, была ли операция выполнена успешно.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Вызывается, когда токены перемещаются с одной учетной записи на другую.
     * @param from Отправитель.
     * @param to Получатель.
     * @param value Количество токенов.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Вызывается, когда выполняется { approve }.
     * @param owner Владелец.
     * @param spender Тратящий аккаунт.
     * @param value Количество токенов.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

/**
 * @author Nikolau Kudryavcev
 * @dev Реализцация токена интерфейса {IERC20}.
 */
contract Token is IERC20, Ownable {
    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string private _name;
    string private _symbol;
    uint256 private _totalSupply;
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }

        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(msg.sender, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
