//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// QUESTION: можно ли импортировать со своей репы гитхаба?
import "./Token.sol";

contract DAO is Token {
    enum VoteStatus {
        ACTIVE,
        COMPLETE
    }
    enum VoteType {
        agree,
        disagree
    }
    struct VoteStruct {
        uint256 agree;
        uint256 disagree;
    }
    struct Proposal {
        string description;
        address recipient;
        bytes32 byteCode;
        address author;
        VoteStruct votes;
        uint256 startTime;
        uint32 minimumQuorum;
        uint32 quorum;
        VoteStatus status;
    }

    string private _name;
    string private _symbol;
    uint8 private immutable _decimals;
    uint256 private _proposalIndex = 0;

    mapping(uint256 => Proposal) public _proposals;
    mapping(uint256 => mapping(address => VoteStruct)) private _votedList;
    mapping(address => uint256) private _voteBalances;
    mapping(address => uint16[]) private _userVotes; // За что голосовал пользователь

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Token(name_, symbol_, decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    function informationOf(uint8 id) public virtual returns (Proposal memory) {
        return _proposals[id];
    }

    function voteBalanceOf(address account)
        public
        view
        virtual
        returns (uint256)
    {
        return _voteBalances[account];
    }

    function createProposal(
        string memory description,
        address recipient,
        bytes32 byteCode,
        uint8 minimumQuorum
    ) public virtual returns (uint256) {
        require(recipient != address(0), "DAO: mint to the zero address");
        require(byteCode.length != 0, "DAO: byte code should not be empty");
        require(
            minimumQuorum != 0,
            "DAO: minimum quorum must be greater than zero"
        );

        uint256 index = _proposalIndex;

        _proposals[index] = Proposal({
            description: description,
            recipient: recipient,
            byteCode: byteCode,
            author: msg.sender,
            votes: VoteStruct({
                agree: 0,
                disagree: 0
            }),
            startTime: block.timestamp,
            minimumQuorum: minimumQuorum,
            quorum: 0,
            status: VoteStatus.ACTIVE
        });

        _proposalIndex += 1;
        return index;
    }

    function voteOf(
        uint8 id,
        uint8 amount,
        VoteType voteType
    ) public virtual {
        require(
            voteType != VoteType.agree || voteType != VoteType.disagree,
            "DAO: minimum quorum must be greater than zero"
        );

        if (
            _votedList[id][msg.sender].agree == 0 &&
            _votedList[id][msg.sender].disagree == 0
        ) {
            _proposals[id].quorum += 1;
        }

        if (
            voteType == VoteType.agree
        ) {
            _votedList[id][msg.sender].agree += amount;
            _proposals[id].votes.agree += amount;
        } else {
            _votedList[id][msg.sender].disagree += amount;
            _proposals[id].votes.disagree += amount;
        }
    }

    function finish(uint8 id) public virtual {
        require(
            _proposals[id].status != VoteStatus.COMPLETE,
            "DAO: proposal is already completed"
        );
        _proposals[id].status = VoteStatus.COMPLETE;
        // TODO: Добавить возврат денег
    }

    function deposit(uint256 amount) public virtual {
        uint256 balance = Token._balances[msg.sender];
        require(balance >= amount, "DAO: transfer amount exceeds balance");
        unchecked {
            Token._balances[_msgSender()] = balance - amount;
        }
        _voteBalances[_msgSender()] += amount;
    }

    function withdraw(uint256 amount) public virtual {
        uint256 balance = _voteBalances[msg.sender];
        require(balance >= amount, "DAO: transfer amount exceeds vote balance");

        for (uint256 i = 0; i < _userVotes[_msgSender()].length; i++) {
            uint256 proposalIndex = _userVotes[_msgSender()][i];
            require(
                _proposals[proposalIndex].status != VoteStatus.ACTIVE,
                "DAO: there are active voting"
            );
        }

        Token._balances[_msgSender()] += amount;

        unchecked {
            _voteBalances[_msgSender()] -= amount;
        }
    }
}
