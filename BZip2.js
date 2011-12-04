/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
* 
* Code provided is port of Apaches BZip2CompressorOutputStream
* assumed that input is string (inputString.charCodeAt)
* http://commons.apache.org/compress/apidocs/org/apache/commons/compress/compressors/bzip2/BZip2CompressorOutputStream.html
* 
**/

/** class BZipConstants **/
var BASEBLOCKSIZE = 100000;
var MAX_ALPHA_SIZE = 258;
var MAX_CODE_LEN = 23;
var RUNA = 0;
var RUNB = 1;
var N_GROUPS = 6;
var G_SIZE = 50;
var N_ITERS = 4;
var MAX_SELECTORS = (2 + parseInt(900000 / G_SIZE));
var NUM_OVERSHOOT_BYTES = 20;

var MIN_BLOCKSIZE = 1;
var MAX_BLOCKSIZE = 9;
var SETMASK = (1 << 21);
var CLEARMASK = (~SETMASK);
var GREATER_ICOST = 15;
var LESSER_ICOST = 0;
var SMALL_THRESH = 20;
var DEPTH_THRESH = 10;
var WORK_FACTOR = 30;
var QSORT_STACK_SIZE = 1000;
var INCS = [1, 4, 13, 40, 121, 364, 1093, 3280, 9841, 29524, 88573, 265720, 797161, 2391484];

/** class Rand **/
Rand = {}
Rand.rNums = function(i){
    return Rand.RNUMS[i];
}

Rand.RNUMS = [
    619, 720, 127, 481, 931, 816, 813, 233, 566, 247,
    985, 724, 205, 454, 863, 491, 741, 242, 949, 214,
    733, 859, 335, 708, 621, 574,  73, 654, 730, 472,
    419, 436, 278, 496, 867, 210, 399, 680, 480,  51,
    878, 465, 811, 169, 869, 675, 611, 697, 867, 561,
    862, 687, 507, 283, 482, 129, 807, 591, 733, 623,
    150, 238,  59, 379, 684, 877, 625, 169, 643, 105,
    170, 607, 520, 932, 727, 476, 693, 425, 174, 647,
     73, 122, 335, 530, 442, 853, 695, 249, 445, 515,
    909, 545, 703, 919, 874, 474, 882, 500, 594, 612,
    641, 801, 220, 162, 819, 984, 589, 513, 495, 799,
    161, 604, 958, 533, 221, 400, 386, 867, 600, 782,
    382, 596, 414, 171, 516, 375, 682, 485, 911, 276,
     98, 553, 163, 354, 666, 933, 424, 341, 533, 870,
    227, 730, 475, 186, 263, 647, 537, 686, 600, 224,
    469,  68, 770, 919, 190, 373, 294, 822, 808, 206,
    184, 943, 795, 384, 383, 461, 404, 758, 839, 887,
    715,  67, 618, 276, 204, 918, 873, 777, 604, 560,
    951, 160, 578, 722,  79, 804,  96, 409, 713, 940,
    652, 934, 970, 447, 318, 353, 859, 672, 112, 785,
    645, 863, 803, 350, 139,  93, 354,  99, 820, 908,
    609, 772, 154, 274, 580, 184,  79, 626, 630, 742,
    653, 282, 762, 623, 680,  81, 927, 626, 789, 125,
    411, 521, 938, 300, 821,  78, 343, 175, 128, 250,
    170, 774, 972, 275, 999, 639, 495,  78, 352, 126,
    857, 956, 358, 619, 580, 124, 737, 594, 701, 612,
    669, 112, 134, 694, 363, 992, 809, 743, 168, 974,
    944, 375, 748,  52, 600, 747, 642, 182, 862,  81,
    344, 805, 988, 739, 511, 655, 814, 334, 249, 515,
    897, 955, 664, 981, 649, 113, 974, 459, 893, 228,
    433, 837, 553, 268, 926, 240, 102, 654, 459, 51,
    686, 754, 806, 760, 493, 403, 415, 394, 687, 700,
    946, 670, 656, 610, 738, 392, 760, 799, 887, 653,
    978, 321, 576, 617, 626, 502, 894, 679, 243, 440,
    680, 879, 194, 572, 640, 724, 926,  56, 204, 700,
    707, 151, 457, 449, 797, 195, 791, 558, 945, 679,
    297,  59,  87, 824, 713, 663, 412, 693, 342, 606,
    134, 108, 571, 364, 631, 212, 174, 643, 304, 329,
    343,  97, 430, 751, 497, 314, 983, 374, 822, 928,
    140, 206,  73, 263, 980, 736, 876, 478, 430, 305,
    170, 514, 364, 692, 829,  82, 855, 953, 676, 246,
    369, 970, 294, 750, 807, 827, 150, 790, 288, 923,
    804, 378, 215, 828, 592, 281, 565, 555, 710,  82,
    896, 831, 547, 261, 524, 462, 293, 465, 502,  56,
    661, 821, 976, 991, 658, 869, 905, 758, 745, 193,
    768, 550, 608, 933, 378, 286, 215, 979, 792, 961,
     61, 688, 793, 644, 986, 403, 106, 366, 905, 644,
    372, 567, 466, 434, 645, 210, 389, 550, 919, 135,
    780, 773, 635, 389, 707, 100, 626, 958, 165, 504,
    920, 176, 193, 713, 857, 265, 203,  50, 668, 108,
    645, 990, 626, 197, 510, 357, 358, 850, 858, 364,
    936, 638
];

/** class CRC **/
CRC = function() {
    this.initialiseCRC();
}

CRC.prototype.initialiseCRC = function() {
    this.globalCrc = 0xffffffff;
}

CRC.prototype.getFinalCRC = function() {
    return ~this.globalCrc;
}

CRC.prototype.getGlobalCRC = function() {
    return this.globalCrc;
}

CRC.prototype.setGlobalCRC = function(newCrc) {
    this.globalCrc = newCrc;
}

CRC.prototype.updateCRC = function(inCh) {
    var temp = (this.globalCrc >> 24) ^ inCh;
    if (temp < 0) {
        temp = 256 + temp;
    }
    this.globalCrc = (this.globalCrc << 8) ^ CRC.crc32Table[temp];
}

CRC.prototype.updateCRC1 = function(inCh, repeat) {
    var globalCrcShadow = this.globalCrc;
    while (repeat-- > 0) {
        var temp = (globalCrcShadow >> 24) ^ inCh;
        globalCrcShadow = (globalCrcShadow << 8) ^ CRC.crc32Table[(temp >= 0)
                                                  ? temp
                                                  : (temp + 256)];
    }
    this.globalCrc = globalCrcShadow;
}

CRC.prototype.globalCrc = 0;

CRC.crc32Table = [
    0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9,
    0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
    0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61,
    0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
    0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9,
    0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
    0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011,
    0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
    0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039,
    0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
    0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81,
    0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
    0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49,
    0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
    0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1,
    0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
    0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae,
    0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
    0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16,
    0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
    0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde,
    0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
    0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066,
    0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
    0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e,
    0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
    0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6,
    0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
    0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e,
    0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
    0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686,
    0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
    0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637,
    0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
    0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f,
    0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
    0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47,
    0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
    0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff,
    0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
    0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7,
    0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
    0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f,
    0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
    0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7,
    0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
    0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f,
    0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
    0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640,
    0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
    0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8,
    0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
    0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30,
    0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
    0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088,
    0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
    0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0,
    0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
    0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18,
    0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
    0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0,
    0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
    0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668,
    0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
]

/** class BZip2CompressorOutputStream$Data **/
Data = function(blockSize100k) {
    var n = blockSize100k * BASEBLOCKSIZE;
    this.block = new Int8Array(n + 1 + NUM_OVERSHOOT_BYTES);
    this.fmap = new Int32Array(n);
    this.sfmap = new Int16Array(2 * n);
    this.quadrant = this.sfmap;
}

function matrix(x, y) {
    var m = [];
    for (var i = 0; i < x; i++) {
        m.push(new Int8Array(y));
    }
    return m;
}

function matrixInt(x, y) {
    var m = [];
    for (var i = 0; i < x; i++) {
        m.push(new Int32Array(y));
    }
    return m;
}

// with blockSize 900k
Data.prototype.inUse = new Int8Array(256); // 256 byte
Data.prototype.unseqToSeq = new Int8Array(256); // 256 byte
Data.prototype.mtfFreq = new Int32Array(MAX_ALPHA_SIZE); // 1032 byte
Data.prototype.selector = new Int8Array(MAX_SELECTORS); // 18002 byte
Data.prototype.selectorMtf = new Int8Array(MAX_SELECTORS); // 18002 byte

Data.prototype.generateMTFValues_yy = new Int8Array(256); // 256 byte
Data.prototype.sendMTFValues_len = matrix(N_GROUPS, MAX_ALPHA_SIZE); // 1548

// byte
Data.prototype.sendMTFValues_rfreq = matrixInt(N_GROUPS, MAX_ALPHA_SIZE); // 6192
// byte
Data.prototype.sendMTFValues_fave = new Int8Array(N_GROUPS); // 24 byte
Data.prototype.sendMTFValues_cost = new Int16Array(N_GROUPS); // 12 byte
Data.prototype.sendMTFValues_code = matrixInt(N_GROUPS, MAX_ALPHA_SIZE); // 6192

// byte
Data.prototype.sendMTFValues2_pos = new Int8Array(N_GROUPS); // 6 byte
Data.prototype.sentMTFValues4_inUse16 = new Int8Array(16); // 16 byte

Data.prototype.stack_ll = new Int32Array(QSORT_STACK_SIZE); // 4000 byte
Data.prototype.stack_hh = new Int32Array(QSORT_STACK_SIZE); // 4000 byte
Data.prototype.stack_dd = new Int32Array(QSORT_STACK_SIZE); // 4000 byte

Data.prototype.mainSort_runningOrder = new Int32Array(256); // 1024 byte
Data.prototype.mainSort_copy = new Int32Array(256); // 1024 byte
Data.prototype.mainSort_bigDone = new Int8Array(256); // 256 byte

Data.prototype.heap = new Int32Array(MAX_ALPHA_SIZE + 2); // 1040 byte
Data.prototype.weight = new Int32Array(MAX_ALPHA_SIZE * 2); // 2064 byte
Data.prototype.parent = new Int32Array(MAX_ALPHA_SIZE * 2); // 2064 byte

Data.prototype.ftab = new Int32Array(65537); // 262148 byte
// ------------
// 333408 byte

Data.prototype.block = null; // 900021 byte
Data.prototype.fmap = null; // 3600000 byte
Data.prototype.sfmap = null; // 3600000 byte
// ------------
// 8433529 byte
// ============
Data.prototype.quadrant = null;

/** class BZip2CompressorOutputStream **/
BZip2CompressorOutputStream = function(out) {
    this.out = out;
    this.blockSize100k = MAX_BLOCKSIZE;
    this.init();
}

BZip2CompressorOutputStream.prototype.last = 0;
BZip2CompressorOutputStream.prototype.origPtr = 0;
BZip2CompressorOutputStream.prototype.blockSize100k = 0;
BZip2CompressorOutputStream.prototype.blockRandomised = false;
BZip2CompressorOutputStream.prototype.bsBuff = 0;
BZip2CompressorOutputStream.prototype.bsLive = 0;
BZip2CompressorOutputStream.prototype.crc = new CRC(); // not implemented
BZip2CompressorOutputStream.prototype.nInUse = 0;
BZip2CompressorOutputStream.prototype.nMTF = 0;
BZip2CompressorOutputStream.prototype.workDone = 0;
BZip2CompressorOutputStream.prototype.workLimit = 0;
BZip2CompressorOutputStream.prototype.firstAttempt = false;
BZip2CompressorOutputStream.prototype.currentChar = -1;
BZip2CompressorOutputStream.prototype.runLength = 0;
BZip2CompressorOutputStream.prototype.blockCRC = 0;
BZip2CompressorOutputStream.prototype.combinedCRC = 0;
BZip2CompressorOutputStream.prototype.allowableBlockSize = 0;

BZip2CompressorOutputStream.prototype.data = null; /*typeof Data*/
BZip2CompressorOutputStream.prototype.out = null; /*typeod OutputStream*/

BZip2CompressorOutputStream.hbMakeCodeLengths = function(len, freq, dat/*typeof Data*/, alphaSize, maxLen) {
    var heap = dat.heap;
    var weight = dat.weight;
    var parent = dat.parent;

    for (var i = alphaSize; --i >= 0;) {
        weight[i + 1] = (freq[i] == 0 ? 1 : freq[i]) << 8;
    }

    for (var tooLong = true; tooLong;) {
        tooLong = false;

        var nNodes = alphaSize;
        var nHeap = 0;
        heap[0] = 0;
        weight[0] = 0;
        parent[0] = -2;

        for (var i = 1; i <= alphaSize; i++) {
            parent[i] = -1;
            nHeap++;
            heap[nHeap] = i;

            var zz = nHeap;
            var tmp = heap[zz];
            while (weight[tmp] < weight[heap[zz >> 1]]) {
                heap[zz] = heap[zz >> 1];
                zz >>= 1;
            }
            heap[zz] = tmp;
        }

        while (nHeap > 1) {
            var n1 = heap[1];
            heap[1] = heap[nHeap];
            nHeap--;

            var yy = 0;
            var zz = 1;
            var tmp = heap[1];

            while (true) {
                yy = zz << 1;

                if (yy > nHeap) {
                    break;
                }

                if ((yy < nHeap) && (weight[heap[yy + 1]] < weight[heap[yy]])) {
                    yy++;
                }

                if (weight[tmp] < weight[heap[yy]]) {
                    break;
                }

                heap[zz] = heap[yy];
                zz = yy;
            }

            heap[zz] = tmp;

            var n2 = heap[1];
            heap[1] = heap[nHeap];
            nHeap--;

            yy = 0;
            zz = 1;
            tmp = heap[1];

            while (true) {
                yy = zz << 1;

                if (yy > nHeap) {
                    break;
                }

                if ((yy < nHeap)
                    && (weight[heap[yy + 1]] < weight[heap[yy]])) {
                    yy++;
                }

                if (weight[tmp] < weight[heap[yy]]) {
                    break;
                }

                heap[zz] = heap[yy];
                zz = yy;
            }

            heap[zz] = tmp;
            nNodes++;
            parent[n1] = parent[n2] = nNodes;

            var weight_n1 = weight[n1];
            var weight_n2 = weight[n2];
            weight[nNodes] = ((weight_n1 & 0xffffff00)
                              + (weight_n2 & 0xffffff00))
                | (1 + (((weight_n1 & 0x000000ff)
                         > (weight_n2 & 0x000000ff))
                        ? (weight_n1 & 0x000000ff)
                        : (weight_n2 & 0x000000ff)));

            parent[nNodes] = -1;
            nHeap++;
            heap[nHeap] = nNodes;

            tmp = 0;
            zz = nHeap;
            tmp = heap[zz];
            var weight_tmp = weight[tmp];
            while (weight_tmp < weight[heap[zz >> 1]]) {
                heap[zz] = heap[zz >> 1];
                zz >>= 1;
            }
            heap[zz] = tmp;

        }

        for (var i = 1; i <= alphaSize; i++) {
            var j = 0;
            var k = i;

            for (var parent_k; (parent_k = parent[k]) >= 0;) {
                k = parent_k;
                j++;
            }

            len[i - 1] = j;
            if (j > maxLen) {
                tooLong = true;
            }
        }

        if (tooLong) {
            for (var i = 1; i < alphaSize; i++) {
                var j = weight[i] >> 8;
                j = 1 + (j >> 1);
                weight[i] = j << 8;
            }
        }
    }
}

BZip2CompressorOutputStream.chooseBlockSize = function(inputLength) {
    return (inputLength > 0) ? parseInt(Math.min((inputLength / 132000) + 1, 9)) : MAX_BLOCKSIZE;
}

BZip2CompressorOutputStream.prototype.write = function(b) {
    if (this.out != null) {
        write0(b);
    } else {
        throw "IOException closed";
    }
}

BZip2CompressorOutputStream.prototype.writeRun = function() {
    var lastShadow = this.last;

    if (lastShadow < this.allowableBlockSize) {
        var currentCharShadow = this.currentChar;
        var dataShadow = this.data;
        dataShadow.inUse[currentCharShadow] = true;
        var ch = currentCharShadow;

        var runLengthShadow = this.runLength;
        this.crc.updateCRC1(currentCharShadow, runLengthShadow);

        switch (runLengthShadow) {
            case 1:
                dataShadow.block[lastShadow + 2] = ch;
                this.last = lastShadow + 1;
                break;
            case 2:
                dataShadow.block[lastShadow + 2] = ch;
                dataShadow.block[lastShadow + 3] = ch;
                this.last = lastShadow + 2;
                break;
            case 3: {
                var block = dataShadow.block;
                block[lastShadow + 2] = ch;
                block[lastShadow + 3] = ch;
                block[lastShadow + 4] = ch;
                this.last = lastShadow + 3;
                break;
            }
            default: {
                runLengthShadow -= 4;
                dataShadow.inUse[runLengthShadow] = true;
                var block = dataShadow.block;
                block[lastShadow + 2] = ch;
                block[lastShadow + 3] = ch;
                block[lastShadow + 4] = ch;
                block[lastShadow + 5] = ch;
                block[lastShadow + 6] = runLengthShadow;
                this.last = lastShadow + 5;
                break;
            }
        }
    } else {
        this.endBlock();
        this.initBlock();
        this.writeRun();
    }
}


BZip2CompressorOutputStream.prototype.finalize = function() {
    this.finish();
}


BZip2CompressorOutputStream.prototype.finish = function() {
    if (this.out != null) {
        try {
            if (this.runLength > 0) {
                this.writeRun();
            }
            this.currentChar = -1;
            this.endBlock();
            this.endCompression();
        } finally {
            this.out = null;
            this.data = null;
        }
    }
}

BZip2CompressorOutputStream.prototype.close = function() {
    if (this.out != null) {
        var outShadow = this.out;
        this.finish();
        outShadow.close();
    }
}

BZip2CompressorOutputStream.prototype.flush = function() {
    var outShadow = this.out;
    if (outShadow != null) {
        outShadow.flush();
    }
}

BZip2CompressorOutputStream.prototype.init = function() {
    this.bsPutUByte('B'.charCodeAt(0));
    this.bsPutUByte('Z'.charCodeAt(0));

    this.data = new Data(this.blockSize100k);

    // huffmanised magic bytes
    this.bsPutUByte('h'.charCodeAt(0));
    this.bsPutUByte("0".charCodeAt(0) + this.blockSize100k);

    this.combinedCRC = 0;
    this.initBlock();
}

BZip2CompressorOutputStream.prototype.initBlock = function() {
    // blockNo++;
    this.crc.initialiseCRC();
    this.last = -1;
    // ch = 0;

    var inUse = this.data.inUse;
    for (var i = 256; --i >= 0;) {
        inUse[i] = false;
    }

    /* 20 is just a paranoia constant */
    this.allowableBlockSize = (this.blockSize100k * BASEBLOCKSIZE) - 20;
}

BZip2CompressorOutputStream.prototype.endBlock = function() {
    this.blockCRC = this.crc.getFinalCRC();
    this.combinedCRC = (this.combinedCRC << 1) | (this.combinedCRC >>> 31);
    this.combinedCRC ^= this.blockCRC;

    // empty block at end of file
    if (this.last == -1) {
        return;
    }

    /* sort the block and establish posn of original string */
    this.blockSort();

    /*
     * A 6-byte block header, the value chosen arbitrarily as 0x314159265359
     * :-). A 32 bit value does not really give a strong enough guarantee
     * that the value will not appear by chance in the compressed
     * datastream. Worst-case probability of this event, for a 900k block,
     * is about 2.0e-3 for 32 bits, 1.0e-5 for 40 bits and 4.0e-8 for 48
     * bits. For a compressed file of size 100Gb -- about 100000 blocks --
     * only a 48-bit marker will do. NB: normal compression/ decompression
     * donot rely on these statistical properties. They are only important
     * when trying to recover blocks from damaged files.
     */
    this.bsPutUByte(0x31);
    this.bsPutUByte(0x41);
    this.bsPutUByte(0x59);
    this.bsPutUByte(0x26);
    this.bsPutUByte(0x53);
    this.bsPutUByte(0x59);

    /* Now the block's CRC, so it is in a known place. */
    this.bsPutInt(this.blockCRC);

    /* Now a single bit indicating randomisation. */
    if (this.blockRandomised) {
        this.bsW(1, 1);
    } else {
        this.bsW(1, 0);
    }

    /* Finally, block's contents proper. */
    this.moveToFrontCodeAndSend();
}

BZip2CompressorOutputStream.prototype.endCompression = function() {
    /*
     * Now another magic 48-bit number, 0x177245385090, to indicate the end
     * of the last block. (sqrt(pi), if you want to know. I did want to use
     * e, but it contains too much repetition -- 27 18 28 18 28 46 -- for me
     * to feel statistically comfortable. Call me paranoid.)
     */
    this.bsPutUByte(0x17);
    this.bsPutUByte(0x72);
    this.bsPutUByte(0x45);
    this.bsPutUByte(0x38);
    this.bsPutUByte(0x50);
    this.bsPutUByte(0x90);

    this.bsPutInt(this.combinedCRC);
    this.bsFinishedWithStream();
}

/**
 * Returns the blocksize parameter specified at construction time.
 */
BZip2CompressorOutputStream.prototype.getBlockSize = function() {
    return this.blockSize100k;
}

BZip2CompressorOutputStream.prototype.write = function(buf, offs, len) {
    if (offs < 0) {
        throw "IndexOutOfBoundsException: offs(" + offs + ") < 0.";
    }
    if (len < 0) {
        throw "IndexOutOfBoundsException: len(" + len + ") < 0.";
    }
    if (offs + len > buf.length) {
        throw "IndexOutOfBoundsException: offs(" + offs + ") + len("
                                            + len + ") > buf.length("
                                            + buf.length + ").";
    }
    if (this.out == null) {
        throw "IOException: stream closed";
    }

    for (var i = 0; i < buf.length; i++) {
        this.write0(buf.charCodeAt(i));
    }
}

BZip2CompressorOutputStream.prototype.write0 = function(b) {
    if (this.currentChar != -1) {
        if (this.currentChar == b) {
            if (++this.runLength > 254) {
                this.writeRun();
                this.currentChar = -1;
                this.runLength = 0;
            }
            // else nothing to do
        } else {
            this.writeRun();
            this.runLength = 1;
            this.currentChar = b;
        }
    } else {
        this.currentChar = b;
        this.runLength++;
    }
}

BZip2CompressorOutputStream.hbAssignCodes = function(code, length, minLen, maxLen,alphaSize) {
    var vec = 0;
    for (var n = minLen; n <= maxLen; n++) {
        for (var i = 0; i < alphaSize; i++) {
            if ((length[i] & 0xff) == n) {
                code[i] = vec;
                vec++;
            }
        }
        vec <<= 1;
    }
}

BZip2CompressorOutputStream.prototype.bsFinishedWithStream = function() {
    while (this.bsLive > 0) {
        var ch = this.bsBuff >> 24;
        this.out.write(ch); // write 8-bit
        this.bsBuff <<= 8;
        this.bsLive -= 8;
    }
}

BZip2CompressorOutputStream.prototype.bsW = function(n, v) {
    var outShadow = this.out;
    var bsLiveShadow = this.bsLive;
    var bsBuffShadow = this.bsBuff;

    while (bsLiveShadow >= 8) {
        outShadow.write(bsBuffShadow >> 24); // write 8-bit
        bsBuffShadow <<= 8;
        bsLiveShadow -= 8;
    }

    this.bsBuff = bsBuffShadow | (v << (32 - bsLiveShadow - n));
    this.bsLive = bsLiveShadow + n;
}

BZip2CompressorOutputStream.prototype.bsPutUByte = function(c) {
    this.bsW(8, c);
}

BZip2CompressorOutputStream.prototype.bsPutInt = function(u) {
    this.bsW(8, (u >> 24) & 0xff);
    this.bsW(8, (u >> 16) & 0xff);
    this.bsW(8, (u >> 8) & 0xff);
    this.bsW(8, u & 0xff);
}

BZip2CompressorOutputStream.prototype.sendMTFValues = function() {
    var len = this.data.sendMTFValues_len;
    var alphaSize = this.nInUse + 2;

    for (var t = N_GROUPS; --t >= 0;) {
        var len_t = len[t];
        for (var v = alphaSize; --v >= 0;) {
            len_t[v] = GREATER_ICOST;
        }
    }

    /* Decide how many coding tables to use */
    // assert (this.nMTF > 0) : this.nMTF;
    var nGroups = (this.nMTF < 200) ? 2 : (this.nMTF < 600) ? 3
        : (this.nMTF < 1200) ? 4 : (this.nMTF < 2400) ? 5 : 6;

    /* Generate an initial set of coding tables */
    this.sendMTFValues0(nGroups, alphaSize);

    /*
     * Iterate up to N_ITERS times to improve the tables.
     */
    var nSelectors = this.sendMTFValues1(nGroups, alphaSize);

    /* Compute MTF values for the selectors. */
    this.sendMTFValues2(nGroups, nSelectors);

    /* Assign actual codes for the tables. */
    this.sendMTFValues3(nGroups, alphaSize);

    /* Transmit the mapping table. */
    this.sendMTFValues4();

    /* Now the selectors. */
    this.sendMTFValues5(nGroups, nSelectors);

    /* Now the coding tables. */
    this.sendMTFValues6(nGroups, alphaSize);

    /* And finally, the block data proper */
    this.sendMTFValues7();
}

BZip2CompressorOutputStream.prototype.sendMTFValues0 = function(nGroups, alphaSize) {
    var len = this.data.sendMTFValues_len;
    var mtfFreq = this.data.mtfFreq;

    var remF = this.nMTF;
    var gs = 0;

    for (var nPart = nGroups; nPart > 0; nPart--) {
        var tFreq = parseInt(remF / nPart);
        var ge = gs - 1;
        var aFreq = 0;

        for (var a = alphaSize - 1; (aFreq < tFreq) && (ge < a);) {
            aFreq += mtfFreq[++ge];
        }

        if ((ge > gs) && (nPart != nGroups) && (nPart != 1) && (((nGroups - nPart) & 1) != 0)) {
            aFreq -= mtfFreq[ge--];
        }

        var len_np = len[nPart - 1];
        for (var v = alphaSize; --v >= 0;) {
            if ((v >= gs) && (v <= ge)) {
                len_np[v] = LESSER_ICOST;
            } else {
                len_np[v] = GREATER_ICOST;
            }
        }

        gs = ge + 1;
        remF -= aFreq;
    }
}

BZip2CompressorOutputStream.prototype.sendMTFValues1 = function(nGroups, alphaSize) {
    var dataShadow = this.data; /* typeof Data */
    var rfreq = dataShadow.sendMTFValues_rfreq;
    var fave = dataShadow.sendMTFValues_fave;
    var cost = dataShadow.sendMTFValues_cost;
    var sfmap = dataShadow.sfmap;
    var selector = dataShadow.selector;
    var len = dataShadow.sendMTFValues_len;
    var len_0 = len[0];
    var len_1 = len[1];
    var len_2 = len[2];
    var len_3 = len[3];
    var len_4 = len[4];
    var len_5 = len[5];
    var nMTFShadow = this.nMTF;

    var nSelectors = 0;

    for (var iter = 0; iter < N_ITERS; iter++) {
        for (var t = nGroups; --t >= 0;) {
            fave[t] = 0;
            var  rfreqt = rfreq[t];
            for (var i = alphaSize; --i >= 0;) {
                rfreqt[i] = 0;
            }
        }

        nSelectors = 0;

        for (var  gs = 0; gs < this.nMTF;) {
            /* Set group start & end marks. */

            /*
             * Calculate the cost of this group as coded by each of the
             * coding tables.
             */

            var  ge = Math.min(gs + G_SIZE - 1, nMTFShadow - 1);

            if (nGroups == N_GROUPS) {
                // unrolled version of the else-block

                var cost0 = 0;
                var cost1 = 0;
                var cost2 = 0;
                var cost3 = 0;
                var cost4 = 0;
                var cost5 = 0;

                for (var  i = gs; i <= ge; i++) {
                    var icv = sfmap[i];
                    cost0 += len_0[icv] & 0xff;
                    cost1 += len_1[icv] & 0xff;
                    cost2 += len_2[icv] & 0xff;
                    cost3 += len_3[icv] & 0xff;
                    cost4 += len_4[icv] & 0xff;
                    cost5 += len_5[icv] & 0xff;
                }

                cost[0] = cost0;
                cost[1] = cost1;
                cost[2] = cost2;
                cost[3] = cost3;
                cost[4] = cost4;
                cost[5] = cost5;
            } else {
                for (var t = nGroups; --t >= 0;) {
                    cost[t] = 0;
                }

                for (var i = gs; i <= ge; i++) {
                    var icv = sfmap[i];
                    for (var t = nGroups; --t >= 0;) {
                        cost[t] += len[t][icv] & 0xff;
                    }
                }
            }

            /*
             * Find the coding table which is best for this group, and
             * record its identity in the selector table.
             */
            var bt = -1;
            for (var t = nGroups, bc = 999999999; --t >= 0;) {
                var cost_t = cost[t];
                if (cost_t < bc) {
                    bc = cost_t;
                    bt = t;
                }
            }

            fave[bt]++;
            selector[nSelectors] = bt;
            nSelectors++;

            /*
             * Increment the symbol frequencies for the selected table.
             */
            var rfreq_bt = rfreq[bt];
            for (var i = gs; i <= ge; i++) {
                rfreq_bt[sfmap[i]]++;
            }

            gs = ge + 1;
        }

        /*
         * Recompute the tables based on the accumulated frequencies.
         */
        for (var t = 0; t < nGroups; t++) {
            BZip2CompressorOutputStream.hbMakeCodeLengths(len[t], rfreq[t], this.data, alphaSize, 20);
        }
    }

    return nSelectors;
}

BZip2CompressorOutputStream.prototype.sendMTFValues2 = function(nGroups, nSelectors) {
    // assert (nGroups < 8) : nGroups;

    var dataShadow = this.data; /* typeof Data */
    var pos = dataShadow.sendMTFValues2_pos;

    for (var i = nGroups; --i >= 0;) {
        pos[i] = i;
    }

    for (var i = 0; i < nSelectors; i++) {
        var ll_i = dataShadow.selector[i];
        var tmp = pos[0];
        var j = 0;

        while (ll_i != tmp) {
            j++;
            var tmp2 = tmp;
            tmp = pos[j];
            pos[j] = tmp2;
        }

        pos[0] = tmp;
        dataShadow.selectorMtf[i] = j;
    }
}

BZip2CompressorOutputStream.prototype.sendMTFValues3 = function(nGroups, alphaSize) {
    var code = this.data.sendMTFValues_code;
    var len = this.data.sendMTFValues_len;

    for (var t = 0; t < nGroups; t++) {
        var minLen = 32;
        var maxLen = 0;
        var len_t = len[t];
        for (var i = alphaSize; --i >= 0;) {
            var l = len_t[i] & 0xff;
            if (l > maxLen) {
                maxLen = l;
            }
            if (l < minLen) {
                minLen = l;
            }
        }

        // assert (maxLen <= 20) : maxLen;
        // assert (minLen >= 1) : minLen;

        BZip2CompressorOutputStream.hbAssignCodes(code[t], len[t], minLen, maxLen, alphaSize);
    }
}

BZip2CompressorOutputStream.prototype.sendMTFValues4 = function() {
    var inUse = this.data.inUse;
    var inUse16 = this.data.sentMTFValues4_inUse16;

    for (var i = 16; --i >= 0;) {
        inUse16[i] = false;
        var i16 = i * 16;
        for (var j = 16; --j >= 0;) {
            if (inUse[i16 + j]) {
                inUse16[i] = true;
            }
        }
    }

    for (var i = 0; i < 16; i++) {
        this.bsW(1, inUse16[i] ? 1 : 0);
    }

    var outShadow = this.out; /* OutputStream */
    var bsLiveShadow = this.bsLive;
    var bsBuffShadow = this.bsBuff;

    for (var i = 0; i < 16; i++) {
        if (inUse16[i]) {
            var i16 = i * 16;
            for (var j = 0; j < 16; j++) {
                // inlined: bsW(1, inUse[i16 + j] ? 1 : 0);
                while (bsLiveShadow >= 8) {
                    outShadow.write(bsBuffShadow >> 24); // write 8-bit
                    bsBuffShadow <<= 8;
                    bsLiveShadow -= 8;
                }
                if (inUse[i16 + j]) {
                    bsBuffShadow |= 1 << (32 - bsLiveShadow - 1);
                }
                bsLiveShadow++;
            }
        }
    }

    this.bsBuff = bsBuffShadow;
    this.bsLive = bsLiveShadow;
}

BZip2CompressorOutputStream.prototype.sendMTFValues5 = function(nGroups, nSelectors) {
    this.bsW(3, nGroups);
    this.bsW(15, nSelectors);

    var outShadow = this.out; /* OutputStream */
    var selectorMtf = this.data.selectorMtf;

    var bsLiveShadow = this.bsLive;
    var bsBuffShadow = this.bsBuff;

    for (var i = 0; i < nSelectors; i++) {
        for (var j = 0, hj = selectorMtf[i] & 0xff; j < hj; j++) {
            // inlined: bsW(1, 1);
            while (bsLiveShadow >= 8) {
                outShadow.write(bsBuffShadow >> 24);
                bsBuffShadow <<= 8;
                bsLiveShadow -= 8;
            }
            bsBuffShadow |= 1 << (32 - bsLiveShadow - 1);
            bsLiveShadow++;
        }

        // inlined: bsW(1, 0);
        while (bsLiveShadow >= 8) {
            outShadow.write(bsBuffShadow >> 24);
            bsBuffShadow <<= 8;
            bsLiveShadow -= 8;
        }
        // bsBuffShadow |= 0 << (32 - bsLiveShadow - 1);
        bsLiveShadow++;
    }

    this.bsBuff = bsBuffShadow;
    this.bsLive = bsLiveShadow;
}

BZip2CompressorOutputStream.prototype.sendMTFValues6 = function(nGroups, alphaSize) {
    var len = this.data.sendMTFValues_len;
    var outShadow = this.out; /* OutputStream */

    var bsLiveShadow = this.bsLive;
    var bsBuffShadow = this.bsBuff;

    for (var t = 0; t < nGroups; t++) {
        var len_t = len[t];
        var curr = len_t[0] & 0xff;

        // inlined: bsW(5, curr);
        while (bsLiveShadow >= 8) {
            outShadow.write(bsBuffShadow >> 24); // write 8-bit
            bsBuffShadow <<= 8;
            bsLiveShadow -= 8;
        }
        bsBuffShadow |= curr << (32 - bsLiveShadow - 5);
        bsLiveShadow += 5;

        for (var i = 0; i < alphaSize; i++) {
            var lti = len_t[i] & 0xff;
            while (curr < lti) {
                // inlined: bsW(2, 2);
                while (bsLiveShadow >= 8) {
                    outShadow.write(bsBuffShadow >> 24); // write 8-bit
                    bsBuffShadow <<= 8;
                    bsLiveShadow -= 8;
                }
                bsBuffShadow |= 2 << (32 - bsLiveShadow - 2);
                bsLiveShadow += 2;

                curr++; /* 10 */
            }

            while (curr > lti) {
                // inlined: bsW(2, 3);
                while (bsLiveShadow >= 8) {
                    outShadow.write(bsBuffShadow >> 24); // write 8-bit
                    bsBuffShadow <<= 8;
                    bsLiveShadow -= 8;
                }
                bsBuffShadow |= 3 << (32 - bsLiveShadow - 2);
                bsLiveShadow += 2;

                curr--; /* 11 */
            }

            // inlined: bsW(1, 0);
            while (bsLiveShadow >= 8) {
                outShadow.write(bsBuffShadow >> 24); // write 8-bit
                bsBuffShadow <<= 8;
                bsLiveShadow -= 8;
            }
            // bsBuffShadow |= 0 << (32 - bsLiveShadow - 1);
            bsLiveShadow++;
        }
    }

    this.bsBuff = bsBuffShadow;
    this.bsLive = bsLiveShadow;
}

BZip2CompressorOutputStream.prototype.sendMTFValues7 = function() {
    var dataShadow = this.data; /* typeof Data */
    var len = dataShadow.sendMTFValues_len;
    var code = dataShadow.sendMTFValues_code;
    var outShadow = this.out; /* OutputStream */
    var selector = dataShadow.selector;
    var sfmap = dataShadow.sfmap;
    var nMTFShadow = this.nMTF;

    var selCtr = 0;

    var bsLiveShadow = this.bsLive;
    var bsBuffShadow = this.bsBuff;

    for (var gs = 0; gs < nMTFShadow;) {
        var ge = Math.min(gs + G_SIZE - 1, nMTFShadow - 1);
        var selector_selCtr = selector[selCtr] & 0xff;
        var code_selCtr = code[selector_selCtr];
        var len_selCtr = len[selector_selCtr];

        while (gs <= ge) {
            var sfmap_i = sfmap[gs];

            //
            // inlined: bsW(len_selCtr[sfmap_i] & 0xff,
            // code_selCtr[sfmap_i]);
            //
            while (bsLiveShadow >= 8) {
                outShadow.write(bsBuffShadow >> 24);
                bsBuffShadow <<= 8;
                bsLiveShadow -= 8;
            }
            var n = len_selCtr[sfmap_i] & 0xFF;
            bsBuffShadow |= code_selCtr[sfmap_i] << (32 - bsLiveShadow - n);
            bsLiveShadow += n;

            gs++;
        }

        gs = ge + 1;
        selCtr++;
    }

    this.bsBuff = bsBuffShadow;
    this.bsLive = bsLiveShadow;
}

BZip2CompressorOutputStream.prototype.moveToFrontCodeAndSend = function() {
    this.bsW(24, this.origPtr);
    this.generateMTFValues();
    this.sendMTFValues();
}

/**
 * This is the most hammered method of this class.
 *
 * <p>
 * This is the version using unrolled loops. Normally I never use such ones
 * in Java code. The unrolling has shown a noticable performance improvement
 * on JRE 1.4.2 (Linux i586 / HotSpot Client). Of course it depends on the
 * JIT compiler of the vm.
 * </p>
 */
BZip2CompressorOutputStream.prototype.mainSimpleSort = function(dataShadow /* Data */, lo, hi, d) {
    var bigN = hi - lo + 1;
    if (bigN < 2) {
        return this.firstAttempt && (this.workDone > this.workLimit);
    }

    var hp = 0;
    while (INCS[hp] < bigN) {
        hp++;
    }

    var fmap = dataShadow.fmap;
    var quadrant = dataShadow.quadrant;
    var block = dataShadow.block;
    var lastShadow = this.last;
    var lastPlus1 = lastShadow + 1;
    var firstAttemptShadow = this.firstAttempt;
    var workLimitShadow = this.workLimit;
    var workDoneShadow = this.workDone;

    // Following block contains unrolled code which could be shortened by
    // coding it in additional loops.

    HP: while (--hp >= 0) {
        var h = INCS[hp];
        var mj = lo + h - 1;

        for (var i = lo + h; i <= hi;) {
            // copy
            for (var k = 3; (i <= hi) && (--k >= 0); i++) {
                var v = fmap[i];
                var vd = v + d;
                var j = i;

                // for (int a;
                // (j > mj) && mainGtU((a = fmap[j - h]) + d, vd,
                // block, quadrant, lastShadow);
                // j -= h) {
                // fmap[j] = a;
                // }
                //
                // unrolled version:

                // start inline mainGTU
                var onceRunned = false;
                var a = 0;

                HAMMER: while (true) {
                    if (onceRunned) {
                        fmap[j] = a;
                        if ((j -= h) <= mj) {
                            break HAMMER;
                        }
                    } else {
                        onceRunned = true;
                    }

                    a = fmap[j - h];
                    var i1 = a + d;
                    var i2 = vd;

                    // following could be done in a loop, but
                    // unrolled it for performance:
                    if (block[i1 + 1] == block[i2 + 1]) {
                        if (block[i1 + 2] == block[i2 + 2]) {
                            if (block[i1 + 3] == block[i2 + 3]) {
                                if (block[i1 + 4] == block[i2 + 4]) {
                                    if (block[i1 + 5] == block[i2 + 5]) {
                                        if (block[(i1 += 6)] == block[(i2 += 6)]) {
                                            var x = lastShadow;
                                            X: while (x > 0) {
                                                x -= 4;

                                                if (block[i1 + 1] == block[i2 + 1]) {
                                                    if (quadrant[i1] == quadrant[i2]) {
                                                        if (block[i1 + 2] == block[i2 + 2]) {
                                                            if (quadrant[i1 + 1] == quadrant[i2 + 1]) {
                                                                if (block[i1 + 3] == block[i2 + 3]) {
                                                                    if (quadrant[i1 + 2] == quadrant[i2 + 2]) {
                                                                        if (block[i1 + 4] == block[i2 + 4]) {
                                                                            if (quadrant[i1 + 3] == quadrant[i2 + 3]) {
                                                                                if ((i1 += 4) >= lastPlus1) {
                                                                                    i1 -= lastPlus1;
                                                                                }
                                                                                if ((i2 += 4) >= lastPlus1) {
                                                                                    i2 -= lastPlus1;
                                                                                }
                                                                                workDoneShadow++;
                                                                                continue X;
                                                                            } else if ((quadrant[i1 + 3] > quadrant[i2 + 3])) {
                                                                                continue HAMMER;
                                                                            } else {
                                                                                break HAMMER;
                                                                            }
                                                                        } else if ((block[i1 + 4] & 0xff) > (block[i2 + 4] & 0xff)) {
                                                                            continue HAMMER;
                                                                        } else {
                                                                            break HAMMER;
                                                                        }
                                                                    } else if ((quadrant[i1 + 2] > quadrant[i2 + 2])) {
                                                                        continue HAMMER;
                                                                    } else {
                                                                        break HAMMER;
                                                                    }
                                                                } else if ((block[i1 + 3] & 0xff) > (block[i2 + 3] & 0xff)) {
                                                                    continue HAMMER;
                                                                } else {
                                                                    break HAMMER;
                                                                }
                                                            } else if ((quadrant[i1 + 1] > quadrant[i2 + 1])) {
                                                                continue HAMMER;
                                                            } else {
                                                                break HAMMER;
                                                            }
                                                        } else if ((block[i1 + 2] & 0xff) > (block[i2 + 2] & 0xff)) {
                                                            continue HAMMER;
                                                        } else {
                                                            break HAMMER;
                                                        }
                                                    } else if ((quadrant[i1] > quadrant[i2])) {
                                                        continue HAMMER;
                                                    } else {
                                                        break HAMMER;
                                                    }
                                                } else if ((block[i1 + 1] & 0xff) > (block[i2 + 1] & 0xff)) {
                                                    continue HAMMER;
                                                } else {
                                                    break HAMMER;
                                                }

                                            }
                                            break HAMMER;
                                        } // while x > 0
                                        else {
                                            if ((block[i1] & 0xff) > (block[i2] & 0xff)) {
                                                continue HAMMER;
                                            } else {
                                                break HAMMER;
                                            }
                                        }
                                    } else if ((block[i1 + 5] & 0xff) > (block[i2 + 5] & 0xff)) {
                                        continue HAMMER;
                                    } else {
                                        break HAMMER;
                                    }
                                } else if ((block[i1 + 4] & 0xff) > (block[i2 + 4] & 0xff)) {
                                    continue HAMMER;
                                } else {
                                    break HAMMER;
                                }
                            } else if ((block[i1 + 3] & 0xff) > (block[i2 + 3] & 0xff)) {
                                continue HAMMER;
                            } else {
                                break HAMMER;
                            }
                        } else if ((block[i1 + 2] & 0xff) > (block[i2 + 2] & 0xff)) {
                            continue HAMMER;
                        } else {
                            break HAMMER;
                        }
                    } else if ((block[i1 + 1] & 0xff) > (block[i2 + 1] & 0xff)) {
                        continue HAMMER;
                    } else {
                        break HAMMER;
                    }

                } // HAMMER
                // end inline mainGTU

                fmap[j] = v;
            }

            if (firstAttemptShadow && (i <= hi)
                && (workDoneShadow > workLimitShadow)) {
                break HP;
            }
        }
    }

    this.workDone = workDoneShadow;
    return firstAttemptShadow && (workDoneShadow > workLimitShadow);
}

BZip2CompressorOutputStream.vswap = function(fmap, p1, p2, n) {
    n += p1;
    while (p1 < n) {
        var t = fmap[p1];
        fmap[p1++] = fmap[p2];
        fmap[p2++] = t;
    }
}

BZip2CompressorOutputStream.med3 = function(a, b, c) {
    return (a < b) ? (b < c ? b : a < c ? c : a) : (b > c ? b : a > c ? c : a);
}

BZip2CompressorOutputStream.prototype.blockSort = function() {
    this.workLimit = WORK_FACTOR * this.last;
    this.workDone = 0;
    this.blockRandomised = false;
    this.firstAttempt = true;
    this.mainSort();

    if (this.firstAttempt && (this.workDone > this.workLimit)) {
        this.randomiseBlock();
        this.workLimit = this.workDone = 0;
        this.firstAttempt = false;
        this.mainSort();
    }

    var fmap = this.data.fmap;
    this.origPtr = -1;
    for (var  i = 0, lastShadow = this.last; i <= lastShadow; i++) {
        if (fmap[i] == 0) {
            this.origPtr = i;
            break;
        }
    }

    // assert (this.origPtr != -1) : this.origPtr;
}

/**
 * Method "mainQSort3", file "blocksort.c", BZip2 1.0.2
 */
BZip2CompressorOutputStream.prototype.mainQSort3 = function(dataShadow /*Data */, loSt, hiSt, dSt) {
    var stack_ll = dataShadow.stack_ll;
    var stack_hh = dataShadow.stack_hh;
    var stack_dd = dataShadow.stack_dd;
    var fmap = dataShadow.fmap;
    var block = dataShadow.block;

    stack_ll[0] = loSt;
    stack_hh[0] = hiSt;
    stack_dd[0] = dSt;

    for (var sp = 1; --sp >= 0;) {
        var lo = stack_ll[sp];
        var hi = stack_hh[sp];
        var d = stack_dd[sp];

        if ((hi - lo < SMALL_THRESH) || (d > DEPTH_THRESH)) {
            if (this.mainSimpleSort(dataShadow, lo, hi, d)) {
                return;
            }
        } else {
            var d1 = d + 1;
            var med = BZip2CompressorOutputStream.med3(block[fmap[lo] + d1], block[fmap[hi] + d1], block[fmap[(lo + hi) >>> 1] + d1]) & 0xff;
            var unLo = lo;
            var unHi = hi;
            var ltLo = lo;
            var gtHi = hi;

            while (true) {
                while (unLo <= unHi) {
                    var n = (block[fmap[unLo] + d1] & 0xff)
                        - med;
                    if (n == 0) {
                        var temp = fmap[unLo];
                        fmap[unLo++] = fmap[ltLo];
                        fmap[ltLo++] = temp;
                    } else if (n < 0) {
                        unLo++;
                    } else {
                        break;
                    }
                }

                while (unLo <= unHi) {
                    var n = (block[fmap[unHi] + d1] & 0xff) - med;
                    if (n == 0) {
                        var temp = fmap[unHi];
                        fmap[unHi--] = fmap[gtHi];
                        fmap[gtHi--] = temp;
                    } else if (n > 0) {
                        unHi--;
                    } else {
                        break;
                    }
                }

                if (unLo <= unHi) {
                    var temp = fmap[unLo];
                    fmap[unLo++] = fmap[unHi];
                    fmap[unHi--] = temp;
                } else {
                    break;
                }
            }

            if (gtHi < ltLo) {
                stack_ll[sp] = lo;
                stack_hh[sp] = hi;
                stack_dd[sp] = d1;
                sp++;
            } else {
                var n = ((ltLo - lo) < (unLo - ltLo)) ? (ltLo - lo)
                    : (unLo - ltLo);
                BZip2CompressorOutputStream.vswap(fmap, lo, unLo - n, n);
                var m = ((hi - gtHi) < (gtHi - unHi)) ? (hi - gtHi)
                    : (gtHi - unHi);
                BZip2CompressorOutputStream.vswap(fmap, unLo, hi - m + 1, m);

                n = lo + unLo - ltLo - 1;
                m = hi - (gtHi - unHi) + 1;

                stack_ll[sp] = lo;
                stack_hh[sp] = n;
                stack_dd[sp] = d;
                sp++;

                stack_ll[sp] = n + 1;
                stack_hh[sp] = m - 1;
                stack_dd[sp] = d1;
                sp++;

                stack_ll[sp] = m;
                stack_hh[sp] = hi;
                stack_dd[sp] = d;
                sp++;
            }
        }
    }
}

BZip2CompressorOutputStream.prototype.mainSort = function() {
    // Set up the 2-byte frequency table
    for (var i = 65537; --i >= 0;) {
        this.data.ftab[i] = 0;
    }

    /*
     * In the various block-sized structures, live data runs from 0 to
     * last+NUM_OVERSHOOT_BYTES inclusive. First, set up the overshoot area
     * for block.
     */
    for (var i = 0; i < NUM_OVERSHOOT_BYTES; i++) {
        this.data.block[this.last + i + 2] = this.data.block[(i % (this.last + 1)) + 1];
    }
    for (var i = this.last + NUM_OVERSHOOT_BYTES +1; --i >= 0;) {
        this.data.quadrant[i] = 0;
    }
    this.data.block[0] = this.data.block[this.last + 1];

    // Complete the initial radix sort:

    var c1 = this.data.block[0] & 0xff;
    for (var i = 0; i <= this.last; i++) {
        var c2 = this.data.block[i + 1] & 0xff;
        this.data.ftab[(c1 << 8) + c2]++;
        c1 = c2;
    }

    for (var i = 1; i <= 65536; i++)
        this.data.ftab[i] += this.data.ftab[i - 1];

    c1 = this.data.block[1] & 0xff;
    for (var i = 0; i < this.last; i++) {
        var c2 = this.data.block[i + 2] & 0xff;
        this.data.fmap[--this.data.ftab[(c1 << 8) + c2]] = i;
        c1 = c2;
    }

    this.data.fmap[--this.data.ftab[((this.data.block[this.last + 1] & 0xff) << 8) + (this.data.block[1] & 0xff)]] = this.last;

    /*
     * Now ftab contains the first loc of every small bucket. Calculate the
     * running order, from smallest to largest big bucket.
     */
    for (var i = 256; --i >= 0;) {
        this.data.mainSort_bigDone[i] = false;
        this.data.mainSort_runningOrder[i] = i;
    }

    for (var h = 364; h != 1;) {
        h = parseInt(h/3);
        for (var i = h; i <= 255; i++) {
            var vv = this.data.mainSort_runningOrder[i];
            var a = this.data.ftab[(vv + 1) << 8] - this.data.ftab[vv << 8];
            var b = h - 1;
            var j = i;
            for (var ro = this.data.mainSort_runningOrder[j - h]; (this.data.ftab[(ro + 1) << 8] - this.data.ftab[ro << 8]) > a; ro = this.data.mainSort_runningOrder[j - h]) {
                this.data.mainSort_runningOrder[j] = ro;
                j -= h;
                if (j <= b) {
                    break;
                }
            }
            this.data.mainSort_runningOrder[j] = vv;
        }
    }

    /*
     * The main sorting loop.
     */
    for (var i = 0; i <= 255; i++) {
        /*
         * Process big buckets, starting with the least full.
         */
        var ss = this.data.mainSort_runningOrder[i];

        // Step 1:
        /*
         * Complete the big bucket [ss] by quicksorting any unsorted small
         * buckets [ss, j]. Hopefully previous pointer-scanning phases have
         * already completed many of the small buckets [ss, j], so we don't
         * have to sort them at all.
         */
        for (var j = 0; j <= 255; j++) {
            var sb = (ss << 8) + j;
            var ftab_sb = this.data.ftab[sb];
            if ((ftab_sb & SETMASK) != SETMASK) {
                var lo = ftab_sb & CLEARMASK;
                var hi = (this.data.ftab[sb + 1] & CLEARMASK) - 1;
                if (hi > lo) {
                    this.mainQSort3(this.data, lo, hi, 2);
                    if (this.firstAttempt && (this.workDone > this.workLimit)) {
                        return;
                    }
                }
                this.data.ftab[sb] = ftab_sb | SETMASK;
            }
        }

        // Step 2:
        // Now scan this big bucket so as to synthesise the
        // sorted order for small buckets [t, ss] for all t != ss.

        for (var j = 0; j <= 255; j++) {
            this.data.mainSort_copy[j] = this.data.ftab[(j << 8) + ss] & CLEARMASK;
        }

        for (var j = this.data.ftab[ss << 8] & CLEARMASK, hj = (this.data.ftab[(ss + 1) << 8] & CLEARMASK); j < hj; j++) {
            var fmap_j = this.data.fmap[j];
            c1 = this.data.block[fmap_j] & 0xff;
            if (!this.data.mainSort_bigDone[c1]) {
                this.data.fmap[this.data.mainSort_copy[c1]] = (fmap_j == 0) ? this.last : (fmap_j - 1);
                this.data.mainSort_copy[c1]++;
            }
        }

        for (var j = 256; --j >= 0;)
            this.data.ftab[(j << 8) + ss] |= SETMASK;

        // Step 3:
        /*
         * The ss big bucket is now done. Record this fact, and update the
         * quadrant descriptors. Remember to update quadrants in the
         * overshoot area too, if necessary. The "if (i < 255)" test merely
         * skips this updating for the last bucket processed, since updating
         * for the last bucket is pointless.
         */
        this.data.mainSort_bigDone[ss] = true;

        if (i < 255) {
            var bbStart = this.data.ftab[ss << 8] & CLEARMASK;
            var bbSize = (this.data.ftab[(ss + 1) << 8] & CLEARMASK) - bbStart;
            var shifts = 0;

            while ((bbSize >> shifts) > 65534) {
                shifts++;
            }

            for (var j = 0; j < bbSize; j++) {
                var a2update = this.data.fmap[bbStart + j];
                var qVal = (j >> shifts);
                this.data.quadrant[a2update] = qVal;
                if (a2update < NUM_OVERSHOOT_BYTES) {
                    this.data.quadrant[a2update + this.last + 1] = qVal;
                }
            }
        }

    }
}

BZip2CompressorOutputStream.prototype.randomiseBlock = function() {
    var inUse = this.data.inUse;
    var block = this.data.block;
    var lastShadow = this.last;

    for (var i = 256; --i >= 0;)
        inUse[i] = false;

    var rNToGo = 0;
    var rTPos = 0;
    for (var i = 0, j = 1; i <= lastShadow; i = j, j++) {
        if (rNToGo == 0) {
            rNToGo = Rand.rNums(rTPos);
            if (++rTPos == 512) {
                rTPos = 0;
            }
        }

        rNToGo--;
        block[j] ^= ((rNToGo == 1) ? 1 : 0);

        // handle 16 bit signed numbers
        inUse[block[j] & 0xff] = true;
    }

    this.blockRandomised = true;
}

BZip2CompressorOutputStream.prototype.generateMTFValues = function() {
    var lastShadow = this.last;
    var dataShadow = this.data; /* Data */
    var inUse = dataShadow.inUse;
    var block = dataShadow.block;
    var fmap = dataShadow.fmap;
    var sfmap = dataShadow.sfmap;
    var mtfFreq = dataShadow.mtfFreq;
    var unseqToSeq = dataShadow.unseqToSeq;
    var yy = dataShadow.generateMTFValues_yy;

    // make maps
    var nInUseShadow = 0;
    for (var i = 0; i < 256; i++) {
        if (inUse[i]) {
            unseqToSeq[i] = nInUseShadow;
            nInUseShadow++;
        }
    }
    this.nInUse = nInUseShadow;

    var  eob = nInUseShadow + 1;

    for (var i = eob; i >= 0; i--) {
        mtfFreq[i] = 0;
    }

    for (var i = nInUseShadow; --i >= 0;) {
        yy[i] = i;
    }

    var wr = 0;
    var zPend = 0;

    for (var i = 0; i <= lastShadow; i++) {
        var  ll_i = unseqToSeq[block[fmap[i]] & 0xff];
        var  tmp = yy[0];
        var  j = 0;

        while (ll_i != tmp) {
            j++;
            var  tmp2 = tmp;
            tmp = yy[j];
            yy[j] = tmp2;
        }
        yy[0] = tmp;

        if (j == 0) {
            zPend++;
        } else {
            if (zPend > 0) {
                zPend--;
                while (true) {
                    if ((zPend & 1) == 0) {
                        sfmap[wr] = RUNA;
                        wr++;
                        mtfFreq[RUNA]++;
                    } else {
                        sfmap[wr] = RUNB;
                        wr++;
                        mtfFreq[RUNB]++;
                    }

                    if (zPend >= 2) {
                        zPend = (zPend - 2) >> 1;
                    } else {
                        break;
                    }
                }
                zPend = 0;
            }
            sfmap[wr] = (j + 1);
            wr++;
            mtfFreq[j + 1]++;
        }
    }

    if (zPend > 0) {
        zPend--;
        while (true) {
            if ((zPend & 1) == 0) {
                sfmap[wr] = RUNA;
                wr++;
                mtfFreq[RUNA]++;
            } else {
                sfmap[wr] = RUNB;
                wr++;
                mtfFreq[RUNB]++;
            }

            if (zPend >= 2) {
                zPend = (zPend - 2) >> 1;
            } else {
                break;
            }
        }
    }

    sfmap[wr] = eob;
    mtfFreq[eob]++;
    this.nMTF = wr + 1;
}

/** class ByteArrayOutputStream dummy **/
ByteArrayOutputStream = function() { this.bytes = []; }
ByteArrayOutputStream.prototype.bytes = [];
ByteArrayOutputStream.prototype.write = function(b) { this.bytes.push(b); }
ByteArrayOutputStream.prototype.close = function() {}
ByteArrayOutputStream.prototype.flush = function() {}

/** 
 * 
 *  class BZip2Compressor
 *  ArrayBuffer to base64 taken from https://gist.github.com/958841
 *   
 **/

BZip2 = {};
BZip2.base64 = function (buf) {
    var base64    = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var bytes         = new Uint8Array(buf);
    var byteLength    = bytes.length;
    var byteRemainder = byteLength % 3;
    var mainLength    = byteLength - byteRemainder;

    var a, b, c, d;
    var chunk;

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4; // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
}

BZip2.toBzip = function(string) {
    var out = new ByteArrayOutputStream();
    var bout = new BZip2CompressorOutputStream(out);
    bout.write(string, 0, string.length);
    bout.flush();
    bout.close();
    return out.bytes;
}

BZip2.toBase64 = function(string) {
    return BZip2.base64(BZip2.toBzip(string));
}