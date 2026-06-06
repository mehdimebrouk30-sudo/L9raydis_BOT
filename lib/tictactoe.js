/**
 * JAWAD.BOT - لعبة إكس-أو (Tic Tac Toe)
 * حقوق النشر © 2025 DarkXecutor
 * 
 * هذا البرنامج مجاني: يمكنك إعادة توزيعه وتعديله
 * وفقاً لرخصة MIT.
 */

class TicTacToe {
    /**
     * إنشاء لعبة جديدة
     * @param {string} playerX - معرف اللاعب X (الرمز ❎)
     * @param {string} playerO - معرف اللاعب O (الرمز ⭕)
     */
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX;           // اللاعب X
        this.playerO = playerO;           // اللاعب O
        this._currentTurn = false;        // false = دور X, true = دور O
        this._x = 0;                      // تحركات اللاعب X (بصيغة bits)
        this._o = 0;                      // تحركات اللاعب O (بصيغة bits)
        this.turns = 0;                   // عدد التحركات (1-9)
    }

    /**
     * الحصول على حالة اللوحة (تحركات كلا اللاعبين)
     * @returns {number} - حالة اللوحة كـ bits
     */
    get board() {
        return this._x | this._o;
    }

    /**
     * الحصول على اللاعب الذي له الدور الآن
     * @returns {string} - معرف اللاعب الحالي
     */
    get currentTurn() {
        return this._currentTurn ? this.playerO : this.playerX;
    }

    /**
     * التحقق من وجود فائز
     * @returns {string|null} - معرف الفائز أو null إذا لم يفز أحد
     */
    get winner() {
        // جميع الأنماط الفائزة الممكنة
        const winningPatterns = [
            0b111000000, // الصف العلوي (الخانات 0,1,2)
            0b000111000, // الصف الأوسط (الخانات 3,4,5)
            0b000000111, // الصف السفلي (الخانات 6,7,8)
            0b100100100, // العمود الأيسر (الخانات 0,3,6)
            0b010010010, // العمود الأوسط (الخانات 1,4,7)
            0b001001001, // العمود الأيمن (الخانات 2,5,8)
            0b100010001, // القطر من أعلى اليسار (الخانات 0,4,8)
            0b001010100  // القطر من أعلى اليمين (الخانات 2,4,6)
        ];

        // التحقق من تحركات اللاعب X
        for (let pattern of winningPatterns) {
            if ((this._x & pattern) === pattern) {
                return this.playerX;
            }
        }

        // التحقق من تحركات اللاعب O
        for (let pattern of winningPatterns) {
            if ((this._o & pattern) === pattern) {
                return this.playerO;
            }
        }

        return null;
    }

    /**
     * التحقق من انتهاء اللعبة بالتعادل
     * @returns {boolean} - true إذا كان تعادلاً
     */
    get isTie() {
        return this.turns === 9 && !this.winner;
    }

    /**
     * تنفيذ حركة في اللعبة
     * @param {boolean} isPlayerO - هل اللاعب هو O (true) أم X (false)
     * @param {number} pos - موقع الخانة (0-8)
     * @returns {number} - 1: نجاح، 0: خانة مشغولة، -1: خطأ
     */
    turn(isPlayerO, pos) {
        // إذا انتهت اللعبة أو الموقع غير صالح
        if (this.winner || this.isTie || pos < 0 || pos > 8) return -1;
        
        // إذا كانت الخانة مشغولة بالفعل
        if ((this._x | this._o) & (1 << pos)) return 0;
        
        // تنفيذ الحركة
        const value = 1 << pos;
        if (isPlayerO) {
            this._o |= value;
        } else {
            this._x |= value;
        }
        
        // تبديل الدور
        this._currentTurn = !this._currentTurn;
        this.turns++;
        return 1;
    }

    /**
     * عرض اللوحة بشكل قابل للقراءة
     * @returns {Array} - مصفوفة تحتوي على الحالة الحالية للوحة
     */
    render() {
        return [...Array(9)].map((_, i) => {
            const bit = 1 << i;
            return this._x & bit ? '❎' : this._o & bit ? '⭕' : (i + 1).toString();
        });
    }

    /**
     * عرض اللوحة كنص منسق
     * @returns {string} - لوحة منسقة كـ نص
     */
    renderAsText() {
        const board = this.render();
        return `
┌───┬───┬───┐
│ ${board[0]} │ ${board[1]} │ ${board[2]} │
├───┼───┼───┤
│ ${board[3]} │ ${board[4]} │ ${board[5]} │
├───┼───┼───┤
│ ${board[6]} │ ${board[7]} │ ${board[8]} │
└───┴───┴───┘`;
    }

    /**
     * إعادة تعيين اللعبة (بداية جديدة)
     */
    reset() {
        this._x = 0;
        this._o = 0;
        this._currentTurn = false;
        this.turns = 0;
    }

    /**
     * الحصول على الخانات المتاحة
     * @returns {Array} - قائمة بالخانات الفارغة
     */
    getAvailableMoves() {
        const moves = [];
        const board = this.board;
        for (let i = 0; i < 9; i++) {
            if (!(board & (1 << i))) {
                moves.push(i + 1);
            }
        }
        return moves;
    }
}

module.exports = TicTacToe;