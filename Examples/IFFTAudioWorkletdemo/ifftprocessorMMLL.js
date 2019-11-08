//gather data for a certain window size and hop size (for example, as prelude to short term Fourier transform)

//MMLL = Musical Machine Listening Library MMLL.js
function MMLLwindowing(windowsize=1024,hopsize=512) {
    
    var self = this;
    
    self.windowsize = windowsize;
    
    if(hopsize>windowsize) hopsize = windowsize;
    
    self.hopsize = hopsize;
    self.overlap = windowsize - hopsize;
    
    self.store = new Array(windowsize);
    
    //only zero old data
    for (var ii=0; ii<self.overlap; ++ii)
        self.store[ii] = 0;
        
    self.storepointer = self.overlap;

    self.next = function(input) {
        
        var n = input.length; //code assumes n divides hopsize
        
        var result = false;
        
        
        //if just output a window of data
        //copy and update storepointer position
        if(self.storepointer>=self.windowsize) {
            
            for (var i=0; i<self.overlap; ++i)
                self.store[i] = self.store[self.hopsize+i];
                
                self.storepointer = self.overlap;
           
            
            
        }
        
        if((self.storepointer+n)>=self.windowsize) {
            n = self.windowsize - self.storepointer;
            //just in case doesn't fit exactly, don't bother if really going to wrap around since unresolvable issue if  overwrite buffer or multiple wraps in one go anyway
            
            result = true;
            
        }
        for (var i=0; i<n; ++i) {
            self.store[self.storepointer+i] = input[i];
            
        }
        
        
        self.storepointer = (self.storepointer + n); //%(self.windowsize);
     
        
//        if(self.storepointer ==0) {
//         
//            console.log("back to zero index");
//        }
 
        return result;
        
    }
    
   

}


//adapted from:
/* 
 * Free FFT and convolution (JavaScript)
 * 
 * Copyright (c) 2017 Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/free-small-fft-in-multiple-languages
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * self software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and self permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */
 
 //added initialisation of cosine tables to avoid recalculation with each frame
 //commented out some currently unneeded functions for now
 


function MMLLFFT() {
    
    var self = this;
    
    self.cosTable = 0;
    self.sinTable = 0;

    
    self.setupFFT = function(n) {
        
        
            //pre calculate
            // Trigonometric tables
            
            
            //if ((n & (n - 1)) == 0)  // Is power of 2, e.g. no overlap of bit pattern since n as 2^k introduces new bit over 2^k-1
            //{
                
                self.cosTable = new Array(n / 2);
                self.sinTable = new Array(n / 2);
                
                for (var i = 0; i < n / 2; i++) {
                    self.cosTable[i] = Math.cos(2 * Math.PI * i / n);
                    self.sinTable[i] = Math.sin(2 * Math.PI * i / n);
                }
                
//            }
//            else  // More complicated algorithm for arbitrary sizes
//            {
//                
//                // Trignometric tables
//                self.cosTable = new Array(n);
//                self.sinTable = new Array(n);
//                for (var i = 0; i < n; i++) {
//                    var j = i * i % (n * 2);  // This is more accurate than j = i * i
//                    self.cosTable[i] = Math.cos(Math.PI * j / n);
//                    self.sinTable[i] = Math.sin(Math.PI * j / n);
//                }
//                
//            }
        
        }

    







/* 
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector's length must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
 */
    //transformRadix2
self.transform = function (real, imag) {
	// Length variables
	var n = real.length;
	if (n != imag.length)
		throw "Mismatched lengths";
	if (n == 1)  // Trivial transform
		return;
	var levels = -1;
	for (var i = 0; i < 32; i++) {
		if (1 << i == n)
			levels = i;  // Equal to log2(n)
	}
	if (levels == -1)
		throw "Length is not a power of 2";
	

	
	// Bit-reversed addressing permutation
	for (var i = 0; i < n; i++) {
		var j = reverseBits(i, levels);
		if (j > i) {
			var temp = real[i];
			real[i] = real[j];
			real[j] = temp;
			temp = imag[i];
			imag[i] = imag[j];
			imag[j] = temp;
		}
	}

	// Cooley-Tukey decimation-in-time radix-2 FFT
	for (var size = 2; size <= n; size *= 2) {
		var halfsize = size / 2;
		var tablestep = n / size;
		for (var i = 0; i < n; i += size) {
			for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
				var l = j + halfsize;
				var tpre =  real[l] * self.cosTable[k] + imag[l] * self.sinTable[k];
				var tpim = -real[l] * self.sinTable[k] + imag[l] * self.cosTable[k];
				real[l] = real[j] - tpre;
				imag[l] = imag[j] - tpim;
				real[j] += tpre;
				imag[j] += tpim;
			}
		}
	}
	
	// Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
	function reverseBits(x, bits) {
		var y = 0;
		for (var i = 0; i < bits; i++) {
			y = (y << 1) | (x & 1);
			x >>>= 1;
		}
		return y;
	}
}

    
    /*
     * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
     * The vector can have any length. This is a wrapper function.
     */
//    self.transform = function(real,imag) {
//        
//        //console.log('check', cosTable.length,sinTable.length, real.length);
//        
//        var n = real.length;
//        if (n != imag.length)
//            throw "Mismatched lengths";
//        if (n == 0)
//            return;
//        else if ((n & (n - 1)) == 0)  // Is power of 2
//            self.transformRadix2(real, imag);
//        else  // More complicated algorithm for arbitrary sizes
//            transformBluestein(real, imag);
//    }

//
///* 
// * Computes the circular convolution of the given real vectors. Each vector's length must be the same.
// */
//function convolveReal(x, y, out) {
//	var n = x.length;
//	if (n != y.length || n != out.length)
//		throw "Mismatched lengths";
//	convolveComplex(x, newArrayOfZeros(n), y, newArrayOfZeros(n), out, newArrayOfZeros(n));
//}
//
//
///* 
// * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
// */
//function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
//	var n = xreal.length;
//	if (n != ximag.length || n != yreal.length || n != yimag.length
//			|| n != outreal.length || n != outimag.length)
//		throw "Mismatched lengths";
//	
//	xreal = xreal.slice();
//	ximag = ximag.slice();
//	yreal = yreal.slice();
//	yimag = yimag.slice();
//	transform(xreal, ximag);
//	transform(yreal, yimag);
//	
//	for (var i = 0; i < n; i++) {
//		var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
//		ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
//		xreal[i] = temp;
//	}
//	inverseTransform(xreal, ximag);
//	
//	for (var i = 0; i < n; i++) {  // Scaling (because self FFT implementation omits it)
//		outreal[i] = xreal[i] / n;
//		outimag[i] = ximag[i] / n;
//	}
//}
//
//
//function newArrayOfZeros(n) {
//	var result = [];
//	for (var i = 0; i < n; i++)
//		result.push(0);
//	return result;
//}
//    
// 
//    
//    /*
//     * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
//     * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
//     * Uses Bluestein's chirp z-transform algorithm.
//     */
//    function transformBluestein(real, imag) {
//        // Find a power-of-2 convolution length m such that m >= n * 2 + 1
//        var n = real.length;
//        if (n != imag.length)
//            throw "Mismatched lengths";
//        var m = 1;
//        while (m < n * 2 + 1)
//            m *= 2;
//        
//        
//        // Temporary vectors and preprocessing
//        var areal = newArrayOfZeros(m);
//        var aimag = newArrayOfZeros(m);
//        for (var i = 0; i < n; i++) {
//            areal[i] =  real[i] * cosTable[i] + imag[i] * sinTable[i];
//            aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
//        }
//        var breal = newArrayOfZeros(m);
//        var bimag = newArrayOfZeros(m);
//        breal[0] = cosTable[0];
//        bimag[0] = sinTable[0];
//        for (var i = 1; i < n; i++) {
//            breal[i] = breal[m - i] = cosTable[i];
//            bimag[i] = bimag[m - i] = sinTable[i];
//        }
//        
//        // Convolution
//        var creal = new Array(m);
//        var cimag = new Array(m);
//        convolveComplex(areal, aimag, breal, bimag, creal, cimag);
//        
//        // Postprocessing
//        for (var i = 0; i < n; i++) {
//            real[i] =  creal[i] * cosTable[i] + cimag[i] * sinTable[i];
//            imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
//        }
//    }
//    
//
    /*
     * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
     * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
     */
    
    
    self.inverseTransform = function(real, imag) {
        self.transform(imag, real);
    }


}

//short term Fourier transform
//currently just calculates power spectrum, could modify later for phase spectrum etc

//window types:
// 0 = rectangular, no windowing
// 1 or other value = Hann
// 2 = sine

function MMLLSTFT(fftsize=1024,hopsize=512,windowtype=0,postfftfunction) {
    
    var self = this;
    
    self.fftsize = fftsize;
    self.hopsize = hopsize; //typically halffftsize, but windowing should cope otherwise too
    self.halffftsize = fftsize/2;
    self.windowtype = windowtype;
    self.postfftfunction = postfftfunction;
    
    self.windowing= new MMLLwindowing(self.fftsize,self.hopsize);
    self.mmllfft = new MMLLFFT(); //
    
    //old KissFFT
    //self.fft = new FFTR(fftsize);
    
    self.mmllfft.setupFFT(fftsize);
    
    self.windowdata = new Float32Array(self.fftsize); //begins as zeroes

    if(self.windowtype==2) {
        
        self.sine = new Float32Array(self.fftsize);
        //sine window (first half of a sine function)
        var sineinc = Math.PI/fftsize;
        for(var i=0;i<fftsize;++i)
            self.sine[i]=Math.sin(sineinc*i);
    }
    else if (self.windowtype!=0) {
    
        var ang=(2.0*Math.PI)/self.fftsize;
        
        self.hann = new Float32Array(self.fftsize);
    for(var i=0;i<fftsize;++i)
        self.hann[i]=0.5 - 0.5*Math.cos(ang*i);
    }
   
    //initialised containing zeroes
    self.powers = new Float32Array(self.halffftsize);
    //var freqs = result.subarray(result.length / 2);
    self.reals = new Float32Array(self.fftsize);
    
    self.complex = new Float32Array(self.fftsize+2);
    
    self.imags = new Float32Array(self.fftsize);
    
    //4 =2*2 compensates for half magnitude if only take non-conjugate part, fftsize compensates for 1/N
    self.fftnormmult = 4*self.fftsize; //*fftsize;// /4; //1.0/fftsize;  or 1/(fftsize.sqrt)
    
    self.inversereals = new Float32Array(self.fftsize);
    self.inverseimags = new Float32Array(self.fftsize);
    
    
    self.inverse = function(fftdata) {
        var k;
        
        for (k = 0; k <= self.halffftsize; ++k) {
            var twok = 2*k;
            
            //create conjugate
            self.inversereals[k] = fftdata[twok];
            self.inverseimags[k] = fftdata[twok+1]; //-1*fftdata[twok+1];
            
            //self.inversereals[self.fftsize-1-k] = self.inversereals[k];
            //self.inverseimags[self.fftsize-1-k] = self.inverseimags[k];
            
        }
        
        for (k = 1; k < self.halffftsize; ++k) {
            //var twok = 2*k;
            
            //create conjugate
            //self.inversereals[k] = fftdata[twok];
            //self.inverseimags[k] = fftdata[twok+1]; //-1*fftdata[twok+1];
            
            self.inversereals[self.fftsize-k] = self.inversereals[k];
            self.inverseimags[self.fftsize-k] = -self.inverseimags[k];
            
        }
        
//        for (k = self.halffftsize; k< self.fftsize; ++k) {
//
//            self.inversereals[k] = 0;
//            self.inverseimags[k] = 0;
//
//        }
        
        //https://www.embedded.com/dsp-tricks-computing-inverse-ffts-using-the-forward-fft/
        
        //self.mmllfft.inverseTransform(self.inversereals, self.inverseimags);
        //self.mmllfft.transform(self.inversereals, self.inverseimags);
        
        
        
        self.mmllfft.transform(self.inverseimags,self.inversereals);
        
        
        //return self.inversereals;
    }
    
    
    self.next = function(input) {
        
        //update by audioblocksize samples
        var ready = self.windowing.next(input);
        
        if(ready) {
            
            for (i = 0; i< self.fftsize; ++i)
                self.imags[i] = 0;
            
            
            //no window function (square window)
            if(self.windowtype==0) {
            for (i = 0; i< self.fftsize; ++i) {
                self.reals[i] = self.windowing.store[i];
                //self.imags[i] = 0.0;
                
            }
            } else {
                
                if(self.windowtype==2) {
                    
                    for (i = 0; i< self.fftsize; ++i) {
                        self.reals[i] = self.windowing.store[i]*self.sine[i];
                    }
                }
                    else {
                for (i = 0; i< self.fftsize; ++i) {
                    self.reals[i] = self.windowing.store[i]*self.hann[i];
                    //self.imags[i] = 0.0;
                }
                        
                }
            }
  
           //var output = self.fft.forward(self.reals);
            
            //old KissFFT
            //self.fft.forward(self.reals,self.complex);
            
            //fft library call
            self.mmllfft.transform(self.reals, self.imags);
            
            //could fill in complex data myself now
            
            for (var k = 0; k <= self.halffftsize; ++k) {
                var twok = 2*k;
                
                self.complex[twok] = self.reals[k];
                self.complex[twok+1] = self.imags[k];
                
            }
            
            
            //output format is interleaved k*2, k*2+1 real and imag parts
            //DC and 0 then bin 1 real and imag ... nyquist and 0
            
            //power spectrum not amps, for comparative testing
            for (var k = 0; k < self.halffftsize; ++k) {
                //Math.sqrt(
                
                //NO //self.powers[k] = ((output[twok] * output[twok]) + (output[twok+1] * output[twok+1]) ); // * fftnormmult;
                
                //old KissFFT
                //var twok = 2*k;
                //self.powers[k] = ((self.complex[twok] * self.complex[twok]) + (self.complex[twok+1] * self.complex[twok+1]) );
                
                //var compareme = (self.reals[k]*self.reals[k]) + (self.imags[k]*self.imags[k]);
                self.powers[k] = (self.reals[k]*self.reals[k]) + (self.imags[k]*self.imags[k]);
                
                //will scale later in onset detector itself
                
                //self.powers[k] = ((self.reals[k] * self.reals[k]) + (self.imags[k] * self.imags[k]) ); // * fftnormmult;
                
                //freqs[k - align] = (2 * k / N) * (sample_rate / 2);
            }
            
            //console.log(self.postfftfunction,'undefined');
            
            if(self.postfftfunction !== undefined)
            self.postfftfunction(self.powers,self.complex); //could pass self.complex as second argument to get phase spectrum etc
            
            
        }
        
        return ready;
        
    }
    
   

}

//output overlapped windows of samples for a certain window size and hop size (for example, as postlude to short term Fourier transform)

//hopsize is length of cross fade, square or triangular window for now

//assumes hopsize <= windowsize/2

function MMLLOverlapAdd(windowsize=1024,hopsize=512,windowtype=0) {
    
    var self = this;
    
    self.windowsize = windowsize;
    
    if(hopsize>windowsize) hopsize = windowsize;
    
    self.hopsize = hopsize;
    self.overlap = windowsize - hopsize;
    
    self.store = new Array(windowsize);
    
    //start zeroed, will be summing to self buffer
    for (var ii=0; ii<self.windowsize; ++ii)
        self.store[ii] = 0;
        
    //self.outputpointer = 0; //self.overlap;

    //input is windowsize long, output will be hopsize long
    self.next = function(input,output) {
 
        //copy data backwards in store by hopsize
        
        var i;
        
        for (i=0; i<self.overlap; ++i) {
            
            self.store[i] = self.store[self.hopsize+i];
        }
        
        //zero end part
        
        for (i=0; i<self.hopsize; ++i) {
            
            self.store[self.hopsize+i] = 0.0;
        }
        
        //sum in new data, windowed appropriately
        
        if(windowtype==0) {
            
            for (var i=0; i<self.windowsize; ++i)
                self.store[i] += input[i];
            
                } else {
                    
                    //triangular windows for linear cross fade for now...
                    var prop;
                    var mult = 1.0/self.hopsize;
                    var index;
                    
                    for (var i=0; i<self.hopsize; ++i) {
                        
                        prop = i*mult;
                        
                        self.store[i] += input[i]*prop;
                        
                        index = self.windowsize-1-i;
                        
                        self.store[index] += input[index]*prop;
                    }
                    
                    for (var i=self.hopsize; i<self.overlap; ++i)
                        self.store[i] += input[i];
                    
                }
        
       
        for (var i=0; i<self.hopsize; ++i) {
            output[i] = self.store[i];
            
        }
        
        //return result;
        
    }
    
   

}

//Nick Collins chord detection algorithm adapted from my SuperCollider KeyTrack code, with addition of MeanSeperation step for vertical vs horizontal, e.g., only use FFT information where tonal predominates over percussive, following:
//Derry FitzGerald (2010) "Harmonic/Percussive Separation using Median Filtering" International Conference on Digital Audio Effects (DAFx)


function MMLLChordDetector(sampleRate, keydecay=2, chromaleak=0.5) {
    
    var self = this; 
    
    //helpful constants
    //#define N 4096
   
    //weighting parameters
    
    //4096 FFT at 44100 SR
    //[720]
    self.g_weights44100 = [ 0.89160997732426, 0.10839002267574, 0.39160997732426, 0.10839002267574, 0.2249433106576, 0.10839002267574, 0.14160997732426, 0.10839002267574, 0.091609977324263, 0.10839002267574, 0.05827664399093, 0.10839002267574, 0.58784929938181, 0.41215070061819, 0.087849299381813, 0.41215070061819, 0.25451596604848, 0.078817367284855, 0.087849299381813, 0.16215070061819, 0.18784929938181, 0.012150700618187, 0.087849299381812, 0.078817367284855, 0.26602607158423, 0.73397392841577, 0.26602607158423, 0.23397392841577, 0.26602607158423, 0.067307261749107, 0.016026071584227, 0.23397392841577, 0.066026071584226, 0.13397392841577, 0.099359404917559, 0.067307261749107, 0.9250662388251, 0.074933761174898, 0.4250662388251, 0.074933761174898, 0.25839957215844, 0.074933761174898, 0.1750662388251, 0.074933761174898, 0.1250662388251, 0.074933761174898, 0.091732905491768, 0.074933761174898, 0.56383187935789, 0.43616812064211, 0.063831879357891, 0.43616812064211, 0.23049854602456, 0.10283478730877, 0.063831879357891, 0.18616812064211, 0.16383187935789, 0.03616812064211, 0.063831879357892, 0.10283478730877, 0.18111740708786, 0.81888259291214, 0.18111740708786, 0.31888259291214, 0.18111740708786, 0.15221592624547, 0.18111740708786, 0.068882592912141, 0.18111740708786, 0.018882592912141, 0.014450740421193, 0.15221592624547, 0.77564554804057, 0.22435445195943, 0.27564554804057, 0.22435445195943, 0.1089788813739, 0.22435445195943, 0.02564554804057, 0.22435445195943, 0.17564554804057, 0.024354451959429, 0.1089788813739, 0.057687785292764, 0.34606307757871, 0.65393692242129, 0.34606307757871, 0.15393692242129, 0.012729744245378, 0.32060358908796, 0.096063077578711, 0.15393692242129, 0.14606307757871, 0.053936922421289, 0.012729744245378, 0.15393692242129, 0.89093630414068, 0.10906369585932, 0.39093630414068, 0.10906369585932, 0.22426963747401, 0.10906369585932, 0.14093630414068, 0.10906369585932, 0.090936304140679, 0.10906369585932, 0.057602970807346, 0.10906369585932, 0.40874628442826, 0.59125371557174, 0.40874628442826, 0.091253715571737, 0.075412951094929, 0.2579203822384, 0.15874628442826, 0.091253715571737, 0.0087462844282626, 0.19125371557174, 0.075412951094929, 0.091253715571738, 0.89788375407457, 0.10211624592543, 0.39788375407457, 0.10211624592543, 0.23121708740791, 0.10211624592543, 0.14788375407457, 0.10211624592543, 0.097883754074573, 0.10211624592543, 0.06455042074124, 0.10211624592543, 0.35664375687383, 0.64335624312617, 0.35664375687383, 0.14335624312617, 0.023310423540502, 0.31002290979283, 0.10664375687383, 0.14335624312617, 0.15664375687384, 0.043356243126163, 0.023310423540502, 0.14335624312616, 0.78321995464853, 0.21678004535147, 0.28321995464853, 0.21678004535147, 0.11655328798186, 0.21678004535147, 0.033219954648526, 0.21678004535147, 0.18321995464853, 0.016780045351474, 0.11655328798186, 0.050113378684807, 0.17569859876363, 0.82430140123637, 0.17569859876363, 0.32430140123637, 0.17569859876362, 0.15763473456971, 0.17569859876363, 0.074301401236374, 0.17569859876363, 0.024301401236373, 0.0090319320969575, 0.15763473456971, 0.53205214316846, 0.46794785683154, 0.032052143168455, 0.46794785683154, 0.19871880983512, 0.13461452349821, 0.032052143168455, 0.21794785683154, 0.13205214316846, 0.067947856831543, 0.032052143168454, 0.13461452349821, 0.8501324776502, 0.1498675223498, 0.3501324776502, 0.1498675223498, 0.18346581098354, 0.1498675223498, 0.1001324776502, 0.1498675223498, 0.050132477650203, 0.1498675223498, 0.01679914431687, 0.1498675223498, 0.12766375871578, 0.87233624128422, 0.12766375871578, 0.37233624128422, 0.12766375871578, 0.20566957461755, 0.12766375871578, 0.12233624128422, 0.12766375871578, 0.072336241284219, 0.12766375871578, 0.039002907950883, 0.36223481417572, 0.63776518582428, 0.36223481417572, 0.13776518582428, 0.028901480842386, 0.30443185249095, 0.11223481417572, 0.13776518582428, 0.16223481417572, 0.037765185824279, 0.028901480842386, 0.13776518582428, 0.55129109608114, 0.44870890391886, 0.05129109608114, 0.44870890391886, 0.21795776274781, 0.11537557058553, 0.05129109608114, 0.19870890391886, 0.15129109608114, 0.048708903918859, 0.051291096081139, 0.11537557058553, 0.69212615515742, 0.30787384484258, 0.19212615515742, 0.30787384484258, 0.025459488490756, 0.30787384484258, 0.19212615515742, 0.057873844842579, 0.092126155157422, 0.10787384484258, 0.025459488490756, 0.14120717817591, 0.78187260828136, 0.21812739171864, 0.28187260828136, 0.21812739171864, 0.11520594161469, 0.21812739171864, 0.031872608281361, 0.21812739171864, 0.18187260828136, 0.018127391718639, 0.11520594161469, 0.051460725051972, 0.81749256885653, 0.18250743114347, 0.31749256885653, 0.18250743114347, 0.15082590218986, 0.18250743114348, 0.067492568856526, 0.18250743114347, 0.017492568856525, 0.18250743114347, 0.15082590218986, 0.015840764476809, 0.79576750814915, 0.20423249185085, 0.29576750814915, 0.20423249185085, 0.12910084148248, 0.20423249185085, 0.045767508149147, 0.20423249185085, 0.19576750814915, 0.0042324918508541, 0.12910084148248, 0.037565825184186, 0.71328751374767, 0.28671248625233, 0.21328751374767, 0.28671248625233, 0.046620847081009, 0.28671248625232, 0.21328751374767, 0.036712486252327, 0.11328751374767, 0.086712486252327, 0.046620847081009, 0.12004581958566, 0.56643990929705, 0.43356009070295, 0.066439909297053, 0.43356009070295, 0.23310657596372, 0.10022675736961, 0.066439909297053, 0.18356009070295, 0.16643990929705, 0.033560090702949, 0.066439909297053, 0.10022675736961, 0.35139719752725, 0.64860280247275, 0.35139719752725, 0.14860280247275, 0.018063864193915, 0.31526946913942, 0.10139719752725, 0.14860280247275, 0.15139719752725, 0.048602802472746, 0.018063864193915, 0.14860280247275, 0.06410428633691, 0.93589571366309, 0.06410428633691, 0.43589571366309, 0.064104286336909, 0.26922904699642, 0.06410428633691, 0.18589571366309, 0.064104286336914, 0.13589571366309, 0.064104286336909, 0.10256238032976, 0.70026495530041, 0.29973504469959, 0.20026495530041, 0.29973504469959, 0.03359828863374, 0.29973504469959, 0.20026495530041, 0.049735044699592, 0.10026495530041, 0.099735044699594, 0.03359828863374, 0.13306837803293, 0.25532751743156, 0.74467248256844, 0.25532751743156, 0.24467248256844, 0.25532751743157, 0.078005815901766, 0.0053275174315637, 0.24467248256844, 0.055327517431562, 0.14467248256844, 0.088660850764901, 0.078005815901766, 0.72446962835144, 0.27553037164856, 0.22446962835144, 0.27553037164856, 0.057802961684772, 0.27553037164856, 0.22446962835144, 0.025530371648557, 0.12446962835144, 0.075530371648557, 0.057802961684772, 0.1088637049819, 0.10258219216228, 0.89741780783772, 0.10258219216228, 0.39741780783772, 0.10258219216228, 0.23075114117105, 0.10258219216228, 0.14741780783772, 0.10258219216228, 0.097417807837718, 0.10258219216228, 0.064084474504388, 0.38425231031485, 0.61574768968515, 0.38425231031485, 0.11574768968515, 0.050918976981516, 0.28241435635182, 0.13425231031485, 0.11574768968515, 0.18425231031485, 0.015747689685151, 0.050918976981516, 0.11574768968515, 0.56374521656272, 0.43625478343728, 0.063745216562722, 0.43625478343728, 0.23041188322939, 0.10292145010394, 0.063745216562722, 0.18625478343728, 0.16374521656272, 0.036254783437278, 0.063745216562722, 0.10292145010394, 0.63498513771305, 0.36501486228695, 0.13498513771305, 0.36501486228695, 0.30165180437972, 0.031681528953617, 0.13498513771305, 0.11501486228695, 0.034985137713051, 0.16501486228695, 0.13498513771305, 0.031681528953617, 0.5915350162983, 0.4084649837017, 0.091535016298302, 0.4084649837017, 0.25820168296497, 0.075131650368367, 0.091535016298302, 0.1584649837017, 0.1915350162983, 0.0084649837017025, 0.091535016298299, 0.075131650368367, 0.42657502749535, 0.57342497250465, 0.42657502749535, 0.073424972504654, 0.093241694162018, 0.24009163917132, 0.17657502749535, 0.073424972504654, 0.026575027495346, 0.17342497250465, 0.093241694162018, 0.073424972504649, 0.13287981859411, 0.86712018140589, 0.13287981859411, 0.36712018140589, 0.13287981859411, 0.20045351473923, 0.13287981859411, 0.11712018140589, 0.1328798185941, 0.067120181405897, 0.13287981859411, 0.033786848072561, 0.7027943950545, 0.2972056049455, 0.2027943950545, 0.2972056049455, 0.03612772838783, 0.2972056049455, 0.2027943950545, 0.047205604945496, 0.10279439505451, 0.097205604945492, 0.03612772838783, 0.13053893827884, 0.12820857267382, 0.87179142732618, 0.12820857267382, 0.37179142732618, 0.12820857267382, 0.20512476065952, 0.12820857267382, 0.12179142732618, 0.12820857267383, 0.071791427326173, 0.12820857267382, 0.038458093992849, 0.40052991060082, 0.59947008939918, 0.40052991060082, 0.099470089399183, 0.067196577267481, 0.26613675606585, 0.15052991060082, 0.099470089399183, 0.0005299106008124, 0.19947008939919, 0.067196577267481, 0.099470089399186, 0.51065503486313, 0.48934496513687, 0.010655034863127, 0.48934496513687, 0.1773217015298, 0.15601163180353, 0.010655034863127, 0.23934496513687, 0.11065503486312, 0.089344965136877, 0.010655034863134, 0.15601163180353, 0.44893925670289, 0.55106074329711, 0.44893925670289, 0.051060743297114, 0.11560592336954, 0.21772740996379, 0.19893925670289, 0.051060743297114, 0.048939256702886, 0.15106074329711, 0.11560592336954, 0.051060743297124, 0.20516438432456, 0.79483561567544, 0.20516438432456, 0.29483561567544, 0.20516438432456, 0.12816894900878, 0.20516438432456, 0.044835615675439, 0.0051643843245643, 0.19483561567544, 0.03849771765789, 0.12816894900878, 0.7685046206297, 0.2314953793703, 0.2685046206297, 0.2314953793703, 0.10183795396303, 0.2314953793703, 0.018504620629699, 0.2314953793703, 0.1685046206297, 0.031495379370301, 0.10183795396303, 0.064828712703635, 0.12749043312544, 0.87250956687456, 0.12749043312544, 0.37250956687456, 0.12749043312544, 0.20584290020789, 0.12749043312544, 0.12250956687456, 0.12749043312544, 0.072509566874555, 0.12749043312544, 0.039176233541222, 0.2699702754261, 0.7300297245739, 0.2699702754261, 0.2300297245739, 0.2699702754261, 0.063363057907234, 0.019970275426104, 0.2300297245739, 0.069970275426101, 0.1300297245739, 0.10330360875943, 0.063363057907234, 0.1830700325966, 0.8169299674034, 0.1830700325966, 0.3169299674034, 0.1830700325966, 0.15026330073673, 0.1830700325966, 0.066929967403397, 0.18307003259659, 0.016929967403405, 0.016403365929932, 0.15026330073673, 0.85315005499069, 0.14684994500931, 0.35315005499069, 0.14684994500931, 0.18648338832404, 0.1468499450093, 0.10315005499069, 0.14684994500931, 0.053150054990692, 0.14684994500931, 0.019816721657368, 0.1468499450093, 0.26575963718821, 0.73424036281179, 0.26575963718821, 0.23424036281179, 0.26575963718821, 0.067573696145123, 0.015759637188211, 0.23424036281179, 0.065759637188205, 0.13424036281179, 0.099092970521544, 0.067573696145123, 0.40558879010901, 0.59441120989099, 0.40558879010901, 0.094411209890993, 0.07225545677566, 0.26107787655767, 0.15558879010901, 0.094411209890993, 0.0055887901090159, 0.19441120989098, 0.07225545677566, 0.094411209891007, 0.25641714534767, 0.74358285465233, 0.25641714534767, 0.24358285465233, 0.25641714534767, 0.07691618798566, 0.0064171453476689, 0.24358285465233, 0.056417145347666, 0.14358285465233, 0.089750478681007, 0.07691618798566, 0.80105982120163, 0.19894017879837, 0.30105982120163, 0.19894017879837, 0.13439315453496, 0.19894017879837, 0.051059821201633, 0.19894017879837, 0.0010598212016248, 0.19894017879838, 0.13439315453496, 0.032273512131705, 0.021310069726255, 0.97868993027375, 0.021310069726255, 0.47868993027375, 0.021310069726269, 0.31202326360706, 0.021310069726255, 0.22868993027375, 0.021310069726246, 0.17868993027375, 0.021310069726269, 0.1453565969404, 0.89787851340579, 0.10212148659421, 0.39787851340579, 0.10212148659421, 0.23121184673912, 0.10212148659421, 0.14787851340579, 0.10212148659421, 0.097878513405794, 0.10212148659421, 0.064545180072457, 0.10212148659421, 0.41032876864912, 0.58967123135088, 0.41032876864912, 0.089671231350877, 0.07699543531578, 0.25633789801755, 0.16032876864912, 0.089671231350877, 0.010328768649129, 0.18967123135087, 0.07699543531578, 0.089671231350887, 0.5370092412594, 0.4629907587406, 0.037009241259398, 0.4629907587406, 0.20367590792606, 0.12965742540727, 0.037009241259398, 0.2129907587406, 0.1370092412594, 0.062990758740602, 0.037009241259398, 0.12965742540727, 0.25498086625089, 0.74501913374911, 0.25498086625089, 0.24501913374911, 0.25498086625089, 0.078352467082444, 0.0049808662508894, 0.24501913374911, 0.054980866250889, 0.14501913374911, 0.088314199584223, 0.078352467082444, 0.53994055085221, 0.46005944914779, 0.039940550852208, 0.46005944914779, 0.20660721751887, 0.12672611581447, 0.039940550852208, 0.21005944914779, 0.1399405508522, 0.060059449147798, 0.039940550852198, 0.12672611581447, 0.36614006519321, 0.63385993480679, 0.36614006519321, 0.13385993480679, 0.032806731859864, 0.30052660147347, 0.11614006519321, 0.13385993480679, 0.16614006519319, 0.03385993480681, 0.032806731859864, 0.1338599348068, 0.70630010998138, 0.29369989001862, 0.20630010998138, 0.29369989001862, 0.039633443314737, 0.2936998900186, 0.20630010998138, 0.043699890018615, 0.10630010998138, 0.093699890018615, 0.039633443314737, 0.12703322335193 ];
    //720
    self.g_bins44100 = [ 5, 6, 10, 11, 15, 16, 20, 21, 25, 26, 30, 31, 5, 6, 10, 11, 16, 17, 21, 22, 27, 28, 32, 33, 5, 6, 11, 12, 17, 18, 22, 23, 28, 29, 34, 35, 6, 7, 12, 13, 18, 19, 24, 25, 30, 31, 36, 37, 6, 7, 12, 13, 19, 20, 25, 26, 32, 33, 38, 39, 6, 7, 13, 14, 20, 21, 27, 28, 34, 35, 40, 41, 7, 8, 14, 15, 21, 22, 28, 29, 36, 37, 43, 44, 7, 8, 15, 16, 22, 23, 30, 31, 38, 39, 45, 46, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 8, 9, 17, 18, 25, 26, 34, 35, 42, 43, 51, 52, 9, 10, 18, 19, 27, 28, 36, 37, 45, 46, 54, 55, 9, 10, 19, 20, 28, 29, 38, 39, 48, 49, 57, 58, 10, 11, 20, 21, 30, 31, 40, 41, 51, 52, 61, 62, 10, 11, 21, 22, 32, 33, 43, 44, 54, 55, 64, 65, 11, 12, 22, 23, 34, 35, 45, 46, 57, 58, 68, 69, 12, 13, 24, 25, 36, 37, 48, 49, 60, 61, 72, 73, 12, 13, 25, 26, 38, 39, 51, 52, 64, 65, 77, 78, 13, 14, 27, 28, 40, 41, 54, 55, 68, 69, 81, 82, 14, 15, 28, 29, 43, 44, 57, 58, 72, 73, 86, 87, 15, 16, 30, 31, 45, 46, 61, 62, 76, 77, 91, 92, 16, 17, 32, 33, 48, 49, 64, 65, 81, 82, 97, 98, 17, 18, 34, 35, 51, 52, 68, 69, 85, 86, 103, 104, 18, 19, 36, 37, 54, 55, 72, 73, 91, 92, 109, 110, 19, 20, 38, 39, 57, 58, 77, 78, 96, 97, 115, 116, 20, 21, 40, 41, 61, 62, 81, 82, 102, 103, 122, 123, 21, 22, 43, 44, 64, 65, 86, 87, 108, 109, 129, 130, 22, 23, 45, 46, 68, 69, 91, 92, 114, 115, 137, 138, 24, 25, 48, 49, 72, 73, 97, 98, 121, 122, 145, 146, 25, 26, 51, 52, 77, 78, 102, 103, 128, 129, 154, 155, 27, 28, 54, 55, 81, 82, 109, 110, 136, 137, 163, 164, 28, 29, 57, 58, 86, 87, 115, 116, 144, 145, 173, 174, 30, 31, 61, 62, 91, 92, 122, 123, 153, 154, 183, 184, 32, 33, 64, 65, 97, 98, 129, 130, 162, 163, 194, 195, 34, 35, 68, 69, 103, 104, 137, 138, 171, 172, 206, 207, 36, 37, 72, 73, 109, 110, 145, 146, 182, 183, 218, 219, 38, 39, 77, 78, 115, 116, 154, 155, 192, 193, 231, 232, 40, 41, 81, 82, 122, 123, 163, 164, 204, 205, 245, 246, 43, 44, 86, 87, 129, 130, 173, 174, 216, 217, 259, 260, 45, 46, 91, 92, 137, 138, 183, 184, 229, 230, 275, 276, 48, 49, 97, 98, 145, 146, 194, 195, 242, 243, 291, 292, 51, 52, 102, 103, 154, 155, 205, 206, 257, 258, 308, 309, 54, 55, 109, 110, 163, 164, 218, 219, 272, 273, 327, 328, 57, 58, 115, 116, 173, 174, 231, 232, 288, 289, 346, 347, 61, 62, 122, 123, 183, 184, 244, 245, 306, 307, 367, 368, 64, 65, 129, 130, 194, 195, 259, 260, 324, 325, 389, 390, 68, 69, 137, 138, 206, 207, 274, 275, 343, 344, 412, 413, 72, 73, 145, 146, 218, 219, 291, 292, 364, 365, 436, 437, 77, 78, 154, 155, 231, 232, 308, 309, 385, 386, 462, 463, 81, 82, 163, 164, 245, 246, 326, 327, 408, 409, 490, 491, 86, 87, 173, 174, 259, 260, 346, 347, 432, 433, 519, 520, 91, 92, 183, 184, 275, 276, 366, 367, 458, 459, 550, 551, 97, 98, 194, 195, 291, 292, 388, 389, 485, 486, 583, 584, 102, 103, 205, 206, 308, 309, 411, 412, 514, 515, 617, 618, 109, 110, 218, 219, 327, 328, 436, 437, 545, 546, 654, 655, 115, 116, 231, 232, 346, 347, 462, 463, 577, 578, 693, 694, 122, 123, 244, 245, 367, 368, 489, 490, 612, 613, 734, 735, 129, 130, 259, 260, 389, 390, 518, 519, 648, 649, 778, 779, 137, 138, 274, 275, 412, 413, 549, 550, 687, 688, 824, 825, 145, 146, 291, 292, 436, 437, 582, 583, 728, 729, 873, 874, 154, 155, 308, 309, 462, 463, 617, 618, 771, 772, 925, 926 ];
    
    //4096 FFT at 48000 SR
    //[720]
    self.g_weights48000 = [ 0.30666666666667, 0.69333333333333, 0.30666666666667, 0.19333333333333, 0.30666666666667, 0.026666666666667, 0.056666666666667, 0.19333333333333, 0.10666666666667, 0.093333333333333, 0.14, 0.026666666666667, 0.027586543807041, 0.97241345619296, 0.027586543807041, 0.47241345619296, 0.02758654380704, 0.30574678952629, 0.027586543807041, 0.22241345619296, 0.027586543807041, 0.17241345619296, 0.02758654380704, 0.13908012285963, 0.73191145326801, 0.26808854673199, 0.23191145326801, 0.26808854673199, 0.065244786601342, 0.26808854673199, 0.23191145326801, 0.018088546731992, 0.13191145326801, 0.068088546731992, 0.065244786601342, 0.10142188006533, 0.41865460692056, 0.58134539307944, 0.41865460692056, 0.081345393079437, 0.08532127358723, 0.2480120597461, 0.16865460692056, 0.081345393079437, 0.018654606920562, 0.18134539307944, 0.08532127358723, 0.081345393079437, 0.086770539160062, 0.91322946083994, 0.086770539160062, 0.41322946083994, 0.086770539160063, 0.24656279417327, 0.086770539160062, 0.16322946083994, 0.086770539160062, 0.11322946083994, 0.086770539160063, 0.079896127506604, 0.73515161776197, 0.26484838223803, 0.23515161776197, 0.26484838223803, 0.068484951095304, 0.26484838223803, 0.23515161776197, 0.014848382238029, 0.13515161776197, 0.064848382238029, 0.068484951095304, 0.098181715571363, 0.36262434726227, 0.63737565273773, 0.36262434726227, 0.13737565273773, 0.02929101392894, 0.30404231940439, 0.11262434726227, 0.13737565273773, 0.16262434726227, 0.037375652737727, 0.02929101392894, 0.13737565273773, 0.96794545252544, 0.032054547474559, 0.46794545252544, 0.032054547474559, 0.30127878585877, 0.03205454747456, 0.21794545252544, 0.032054547474559, 0.16794545252544, 0.03205454747456, 0.13461211919211, 0.03205454747456, 0.54979772942925, 0.45020227057075, 0.049797729429249, 0.45020227057075, 0.21646439609592, 0.11686893723742, 0.049797729429249, 0.20020227057075, 0.14979772942925, 0.05020227057075, 0.049797729429249, 0.11686893723742, 0.10678564881847, 0.89321435118153, 0.10678564881847, 0.39321435118153, 0.10678564881847, 0.22654768451487, 0.10678564881847, 0.14321435118153, 0.10678564881847, 0.093214351181534, 0.10678564881847, 0.059881017848201, 0.63743069905602, 0.36256930094398, 0.13743069905602, 0.36256930094398, 0.30409736572268, 0.029235967610653, 0.13743069905602, 0.11256930094398, 0.037430699056014, 0.16256930094399, 0.13743069905601, 0.029235967610653, 0.14016645162784, 0.85983354837216, 0.14016645162784, 0.35983354837216, 0.14016645162784, 0.1931668817055, 0.14016645162784, 0.10983354837216, 0.14016645162784, 0.059833548372163, 0.14016645162784, 0.02650021503883, 0.61333333333333, 0.38666666666667, 0.11333333333333, 0.38666666666667, 0.28, 0.053333333333333, 0.11333333333333, 0.13666666666667, 0.013333333333334, 0.18666666666667, 0.11333333333333, 0.053333333333333, 0.055173087614081, 0.94482691238592, 0.055173087614081, 0.44482691238592, 0.055173087614081, 0.27816024571925, 0.055173087614081, 0.19482691238592, 0.055173087614082, 0.14482691238592, 0.055173087614081, 0.11149357905259, 0.46382290653602, 0.53617709346398, 0.46382290653602, 0.036177093463982, 0.13048957320268, 0.20284376013065, 0.21382290653602, 0.036177093463982, 0.063822906536019, 0.13617709346398, 0.13048957320268, 0.036177093463982, 0.83730921384113, 0.16269078615887, 0.33730921384113, 0.16269078615887, 0.17064254717446, 0.16269078615887, 0.087309213841126, 0.16269078615887, 0.037309213841124, 0.16269078615888, 0.0039758805077928, 0.16269078615887, 0.17354107832012, 0.82645892167988, 0.17354107832012, 0.32645892167988, 0.17354107832013, 0.15979225501321, 0.17354107832012, 0.076458921679876, 0.17354107832012, 0.026458921679875, 0.0068744116534584, 0.15979225501321, 0.47030323552394, 0.52969676447606, 0.47030323552394, 0.029696764476057, 0.13696990219061, 0.19636343114272, 0.22030323552394, 0.029696764476057, 0.070303235523944, 0.12969676447606, 0.13696990219061, 0.029696764476057, 0.72524869452455, 0.27475130547545, 0.22524869452455, 0.27475130547545, 0.058582027857881, 0.27475130547545, 0.22524869452455, 0.024751305475453, 0.12524869452455, 0.074751305475453, 0.058582027857881, 0.10808463880879, 0.93589090505088, 0.064109094949119, 0.43589090505088, 0.064109094949119, 0.26922423838421, 0.06410909494912, 0.18589090505088, 0.064109094949119, 0.13589090505088, 0.06410909494912, 0.10255757171755, 0.06410909494912, 0.0995954588585, 0.9004045411415, 0.0995954588585, 0.4004045411415, 0.0995954588585, 0.23373787447483, 0.0995954588585, 0.1504045411415, 0.099595458858502, 0.1004045411415, 0.0995954588585, 0.067071207808167, 0.21357129763693, 0.78642870236307, 0.21357129763693, 0.28642870236307, 0.21357129763693, 0.1197620356964, 0.21357129763693, 0.036428702363068, 0.013571297636932, 0.18642870236307, 0.046904630970265, 0.1197620356964, 0.27486139811203, 0.72513860188797, 0.27486139811203, 0.22513860188797, 0.27486139811203, 0.058471935221306, 0.02486139811203, 0.22513860188797, 0.074861398112029, 0.12513860188797, 0.10819473144536, 0.058471935221306, 0.28033290325568, 0.71966709674432, 0.28033290325568, 0.21966709674432, 0.28033290325568, 0.053000430077657, 0.030332903255676, 0.21966709674432, 0.080332903255675, 0.11966709674433, 0.11366623658901, 0.053000430077657, 0.22666666666667, 0.77333333333333, 0.22666666666667, 0.27333333333333, 0.22666666666667, 0.10666666666667, 0.22666666666667, 0.023333333333333, 0.026666666666668, 0.17333333333333, 0.06, 0.10666666666667, 0.11034617522816, 0.88965382477184, 0.11034617522816, 0.38965382477184, 0.11034617522816, 0.22298715810517, 0.11034617522816, 0.13965382477184, 0.11034617522816, 0.089653824771835, 0.11034617522816, 0.056320491438505, 0.92764581307204, 0.072354186927964, 0.42764581307204, 0.072354186927964, 0.26097914640537, 0.072354186927965, 0.17764581307204, 0.072354186927964, 0.12764581307204, 0.072354186927961, 0.094312479738702, 0.072354186927965, 0.67461842768225, 0.32538157231775, 0.17461842768225, 0.32538157231775, 0.0079517610155856, 0.32538157231775, 0.17461842768225, 0.075381572317749, 0.074618427682248, 0.12538157231775, 0.0079517610155856, 0.15871490565108, 0.34708215664025, 0.65291784335975, 0.34708215664025, 0.15291784335975, 0.013748823306917, 0.31958451002642, 0.097082156640248, 0.15291784335975, 0.14708215664025, 0.052917843359751, 0.013748823306917, 0.15291784335975, 0.94060647104789, 0.059393528952114, 0.44060647104789, 0.059393528952114, 0.27393980438122, 0.059393528952114, 0.19060647104789, 0.059393528952114, 0.14060647104789, 0.059393528952111, 0.10727313771455, 0.059393528952114, 0.45049738904909, 0.54950261095091, 0.45049738904909, 0.049502610950906, 0.11716405571576, 0.21616927761757, 0.20049738904909, 0.049502610950906, 0.050497389049093, 0.14950261095091, 0.11716405571576, 0.049502610950905, 0.87178181010177, 0.12821818989823, 0.37178181010177, 0.12821818989823, 0.2051151434351, 0.12821818989823, 0.12178181010177, 0.12821818989823, 0.071781810101766, 0.12821818989823, 0.038448476768437, 0.12821818989823, 0.199190917717, 0.800809082283, 0.199190917717, 0.300809082283, 0.199190917717, 0.13414241561633, 0.199190917717, 0.050809082282999, 0.199190917717, 0.00080908228299563, 0.032524251050333, 0.13414241561633, 0.42714259527386, 0.57285740472614, 0.42714259527386, 0.072857404726136, 0.093809261940531, 0.2395240713928, 0.17714259527386, 0.072857404726136, 0.027142595273864, 0.17285740472614, 0.093809261940531, 0.072857404726136, 0.54972279622406, 0.45027720377594, 0.04972279622406, 0.45027720377594, 0.21638946289073, 0.1169438704426, 0.04972279622406, 0.20027720377594, 0.14972279622406, 0.050277203775937, 0.049722796224065, 0.1169438704426, 0.56066580651135, 0.43933419348865, 0.060665806511352, 0.43933419348865, 0.22733247317802, 0.10600086015531, 0.060665806511352, 0.18933419348865, 0.16066580651135, 0.039334193488651, 0.060665806511352, 0.10600086015531, 0.45333333333333, 0.54666666666667, 0.45333333333333, 0.046666666666667, 0.12, 0.21333333333333, 0.20333333333333, 0.046666666666667, 0.053333333333336, 0.14666666666666, 0.12, 0.046666666666667, 0.22069235045632, 0.77930764954368, 0.22069235045632, 0.27930764954368, 0.22069235045632, 0.11264098287701, 0.22069235045632, 0.029307649543675, 0.020692350456329, 0.17930764954367, 0.054025683789656, 0.11264098287701, 0.85529162614407, 0.14470837385593, 0.35529162614407, 0.14470837385593, 0.1886249594774, 0.14470837385593, 0.10529162614407, 0.14470837385593, 0.055291626144077, 0.14470837385592, 0.021958292810737, 0.14470837385593, 0.3492368553645, 0.6507631446355, 0.3492368553645, 0.1507631446355, 0.015903522031171, 0.31742981130216, 0.099236855364502, 0.1507631446355, 0.1492368553645, 0.050763144635505, 0.015903522031171, 0.1507631446355, 0.6941643132805, 0.3058356867195, 0.1941643132805, 0.3058356867195, 0.027497646613834, 0.3058356867195, 0.1941643132805, 0.055835686719504, 0.094164313280498, 0.1058356867195, 0.027497646613834, 0.13916902005283, 0.88121294209577, 0.11878705790423, 0.38121294209577, 0.11878705790423, 0.21454627542911, 0.11878705790423, 0.13121294209577, 0.11878705790423, 0.081212942095777, 0.11878705790422, 0.047879608762438, 0.11878705790423, 0.90099477809819, 0.099005221901812, 0.40099477809819, 0.099005221901812, 0.23432811143152, 0.09900522190181, 0.15099477809819, 0.099005221901812, 0.10099477809819, 0.099005221901814, 0.067661444764857, 0.09900522190181, 0.74356362020353, 0.25643637979647, 0.24356362020353, 0.25643637979647, 0.076896953536874, 0.25643637979646, 0.24356362020353, 0.0064363797964688, 0.14356362020353, 0.056436379796469, 0.076896953536874, 0.089769713129793, 0.398381835434, 0.601618164566, 0.398381835434, 0.101618164566, 0.065048502100666, 0.26828483123267, 0.148381835434, 0.101618164566, 0.19838183543401, 0.0016181645659913, 0.065048502100666, 0.101618164566, 0.85428519054773, 0.14571480945227, 0.35428519054773, 0.14571480945227, 0.18761852388106, 0.14571480945227, 0.10428519054773, 0.14571480945227, 0.054285190547728, 0.14571480945227, 0.020951857214394, 0.14571480945227, 0.09944559244812, 0.90055440755188, 0.09944559244812, 0.40055440755188, 0.09944559244813, 0.2338877408852, 0.09944559244812, 0.15055440755188, 0.099445592448126, 0.10055440755187, 0.09944559244813, 0.067221074218537, 0.1213316130227, 0.8786683869773, 0.1213316130227, 0.3786683869773, 0.1213316130227, 0.21200172031063, 0.1213316130227, 0.1286683869773, 0.1213316130227, 0.078668386977301, 0.1213316130227, 0.045335053643962, 0.90666666666667, 0.093333333333334, 0.40666666666667, 0.093333333333334, 0.24, 0.093333333333334, 0.15666666666667, 0.093333333333334, 0.10666666666667, 0.093333333333328, 0.073333333333333, 0.093333333333334, 0.44138470091265, 0.55861529908735, 0.44138470091265, 0.05861529908735, 0.10805136757931, 0.22528196575402, 0.19138470091265, 0.05861529908735, 0.041384700912658, 0.15861529908734, 0.10805136757931, 0.058615299087355, 0.71058325228817, 0.28941674771183, 0.21058325228817, 0.28941674771183, 0.043916585621503, 0.28941674771183, 0.21058325228817, 0.039416747711826, 0.11058325228817, 0.089416747711834, 0.043916585621503, 0.12275008104516, 0.698473710729, 0.301526289271, 0.198473710729, 0.301526289271, 0.031807044062343, 0.30152628927099, 0.198473710729, 0.051526289270996, 0.09847371072899, 0.10152628927101, 0.031807044062343, 0.13485962260432, 0.38832862656099, 0.61167137343901, 0.38832862656099, 0.11167137343901, 0.054995293227667, 0.27833804010567, 0.13832862656099, 0.11167137343901, 0.188328626561, 0.011671373439003, 0.054995293227667, 0.111671373439, 0.76242588419157, 0.23757411580843, 0.26242588419157, 0.23757411580843, 0.095759217524896, 0.23757411580844, 0.012425884191572, 0.23757411580843, 0.16242588419157, 0.037574115808434, 0.095759217524896, 0.070907449141771, 0.80198955619638, 0.19801044380362, 0.30198955619638, 0.19801044380362, 0.13532288952971, 0.19801044380362, 0.051989556196375, 0.19801044380362, 0.0019895561963722, 0.19801044380363, 0.13532288952971, 0.031343777136954, 0.48712724040706, 0.51287275959294, 0.48712724040706, 0.012872759592938, 0.15379390707375, 0.17953942625959, 0.23712724040706, 0.012872759592938, 0.087127240407062, 0.11287275959294, 0.15379390707375, 0.012872759592919, 0.796763670868, 0.203236329132, 0.296763670868, 0.203236329132, 0.13009700420133, 0.203236329132, 0.046763670868003, 0.203236329132, 0.19676367086802, 0.0032363291319825, 0.13009700420133, 0.036569662465335, 0.70857038109546, 0.29142961890454, 0.20857038109546, 0.29142961890454, 0.041903714428789, 0.29142961890454, 0.20857038109546, 0.041429618904544, 0.10857038109546, 0.091429618904544, 0.041903714428789, 0.12476295223788, 0.19889118489624, 0.80110881510376, 0.19889118489624, 0.30110881510376, 0.19889118489626, 0.13444214843707, 0.19889118489624, 0.05110881510376, 0.19889118489625, 0.0011088151037484, 0.032224518229593, 0.13444214843707, 0.24266322604541, 0.75733677395459, 0.24266322604541, 0.25733677395459, 0.24266322604541, 0.090670107287925, 0.24266322604541, 0.0073367739545915, 0.042663226045397, 0.1573367739546, 0.075996559378742, 0.090670107287925 ];
    //[720]
    self.g_bins48000 = [ 4, 5, 9, 10, 14, 15, 18, 19, 23, 24, 28, 29, 4, 5, 9, 10, 14, 15, 19, 20, 24, 25, 29, 30, 5, 6, 10, 11, 15, 16, 21, 22, 26, 27, 31, 32, 5, 6, 11, 12, 16, 17, 22, 23, 27, 28, 33, 34, 5, 6, 11, 12, 17, 18, 23, 24, 29, 30, 35, 36, 6, 7, 12, 13, 18, 19, 25, 26, 31, 32, 37, 38, 6, 7, 13, 14, 19, 20, 26, 27, 33, 34, 39, 40, 7, 8, 14, 15, 21, 22, 28, 29, 35, 36, 42, 43, 7, 8, 14, 15, 22, 23, 29, 30, 37, 38, 44, 45, 7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 8, 9, 16, 17, 25, 26, 33, 34, 41, 42, 50, 51, 8, 9, 17, 18, 26, 27, 35, 36, 44, 45, 53, 54, 9, 10, 18, 19, 28, 29, 37, 38, 46, 47, 56, 57, 9, 10, 19, 20, 29, 30, 39, 40, 49, 50, 59, 60, 10, 11, 21, 22, 31, 32, 42, 43, 52, 53, 63, 64, 11, 12, 22, 23, 33, 34, 44, 45, 55, 56, 66, 67, 11, 12, 23, 24, 35, 36, 47, 48, 59, 60, 70, 71, 12, 13, 25, 26, 37, 38, 50, 51, 62, 63, 75, 76, 13, 14, 26, 27, 39, 40, 53, 54, 66, 67, 79, 80, 14, 15, 28, 29, 42, 43, 56, 57, 70, 71, 84, 85, 14, 15, 29, 30, 44, 45, 59, 60, 74, 75, 89, 90, 15, 16, 31, 32, 47, 48, 63, 64, 78, 79, 94, 95, 16, 17, 33, 34, 50, 51, 66, 67, 83, 84, 100, 101, 17, 18, 35, 36, 53, 54, 70, 71, 88, 89, 106, 107, 18, 19, 37, 38, 56, 57, 75, 76, 93, 94, 112, 113, 19, 20, 39, 40, 59, 60, 79, 80, 99, 100, 119, 120, 21, 22, 42, 43, 63, 64, 84, 85, 105, 106, 126, 127, 22, 23, 44, 45, 66, 67, 89, 90, 111, 112, 133, 134, 23, 24, 47, 48, 70, 71, 94, 95, 118, 119, 141, 142, 25, 26, 50, 51, 75, 76, 100, 101, 125, 126, 150, 151, 26, 27, 53, 54, 79, 80, 106, 107, 132, 133, 159, 160, 28, 29, 56, 57, 84, 85, 112, 113, 140, 141, 168, 169, 29, 30, 59, 60, 89, 90, 119, 120, 149, 150, 178, 179, 31, 32, 63, 64, 94, 95, 126, 127, 157, 158, 189, 190, 33, 34, 66, 67, 100, 101, 133, 134, 167, 168, 200, 201, 35, 36, 70, 71, 106, 107, 141, 142, 177, 178, 212, 213, 37, 38, 75, 76, 112, 113, 150, 151, 187, 188, 225, 226, 39, 40, 79, 80, 119, 120, 159, 160, 198, 199, 238, 239, 42, 43, 84, 85, 126, 127, 168, 169, 210, 211, 252, 253, 44, 45, 89, 90, 133, 134, 178, 179, 223, 224, 267, 268, 47, 48, 94, 95, 141, 142, 189, 190, 236, 237, 283, 284, 50, 51, 100, 101, 150, 151, 200, 201, 250, 251, 300, 301, 53, 54, 106, 107, 159, 160, 212, 213, 265, 266, 318, 319, 56, 57, 112, 113, 168, 169, 225, 226, 281, 282, 337, 338, 59, 60, 119, 120, 178, 179, 238, 239, 298, 299, 357, 358, 63, 64, 126, 127, 189, 190, 252, 253, 315, 316, 378, 379, 66, 67, 133, 134, 200, 201, 267, 268, 334, 335, 401, 402, 70, 71, 141, 142, 212, 213, 283, 284, 354, 355, 425, 426, 75, 76, 150, 151, 225, 226, 300, 301, 375, 376, 450, 451, 79, 80, 159, 160, 238, 239, 318, 319, 397, 398, 477, 478, 84, 85, 168, 169, 252, 253, 337, 338, 421, 422, 505, 506, 89, 90, 178, 179, 267, 268, 357, 358, 446, 447, 535, 536, 94, 95, 189, 190, 283, 284, 378, 379, 473, 474, 567, 568, 100, 101, 200, 201, 300, 301, 400, 401, 501, 502, 601, 602, 106, 107, 212, 213, 318, 319, 424, 425, 530, 531, 637, 638, 112, 113, 225, 226, 337, 338, 450, 451, 562, 563, 675, 676, 119, 120, 238, 239, 357, 358, 476, 477, 596, 597, 715, 716, 126, 127, 252, 253, 378, 379, 505, 506, 631, 632, 757, 758, 133, 134, 267, 268, 401, 402, 535, 536, 669, 670, 802, 803, 141, 142, 283, 284, 425, 426, 567, 568, 708, 709, 850, 851 ];
   
    //major chord, minor chord, not worrying about 7ths, 9ths, sus 4, sus 2 et al
    self.g_diatonicmajor = [ 10.0, 0.0, 0.0, 0.0,  9, 0.0, 0.0, 8,  0.0, 0.0, 0.0, 0.0];
    self.g_diatonicminor = [ 10.0, 0.0, 0.0, 9,  0.0, 0.0, 0.0, 8,  0, 0.0, 0.0, 0.0];
    
    //[3] //[7]
    self.g_minor = [0,3,7]; //[0,2,3,5,7,8,11];
    self.g_major = [0,4,7]; //[0,2,4,5,7,9,11];
   

self.setup = function(sampleRate) {
	var i;
    
    self.m_srate = sampleRate;
    
	//if sample rate is 88200 or 96000, assume taking double size FFT to start with
	if(self.m_srate >= (44100*2)) {
        
        //presume double size function withfft(powers){}
        self.stft = new MMLLSTFT(8192,4096,2);
        
        self.m_srate = self.m_srate/2;
    } else {
        
        self.stft = new MMLLSTFT(4096,2048,2);
        
    }
    
    
	if(self.m_srate==44100)
	{
		self.m_weights = self.g_weights44100;
		self.m_bins = self.g_bins44100;
		self.m_frameperiod = 0.046439909297052;
	}
	else  //else 48000; potentially dangerous if it isn't! Fortunately, shouldn't write any data to unknown memory
	{
		self.m_weights = self.g_weights48000;
		self.m_bins = self.g_bins48000;
		self.m_frameperiod = 0.042666666666667;
	}
    
    
    self.numpreviousframes = 10;
    self.halfnumpreviousframes = Math.floor(self.numpreviousframes/2);
    
    self.lower = Math.floor(self.numpreviousframes/2);
    self.upper = Math.floor(self.numpreviousframes/2);
    
    //even
    if(self.numpreviousframes%2==0) {
        
        self.upper = self.upper-1;
        
    }
    
    self.previousfftdata = new Array(1024*self.numpreviousframes);
    self.previousfftdatapointer = 0;
    
    for(i=0; i<(1024*self.numpreviousframes); ++i)
        self.previousfftdata[i] = 0;
    
    
    self.chroma = new Array(12);
    self.m_key = new Array(24);
    self.m_histogram = new Array(24);
    
	//zero chroma
    for(i=0; i<12; ++i)
        self.chroma[i] = 0;
    
    for(i=0; i<24; ++i) {
        self.m_key[i] = 0;
        self.m_histogram[i] = 0;
    }
    
	self.chord = -1; //starts with unknown chord

    self.keydecay = keydecay;
    self.chromaleak = chromaleak;
    
}

    self.setup(sampleRate);

//must pass in fft data (power spectrum)
self.next = function(input) {

    var i,j;
 
    var ready = self.stft.next(input);
    
    if(ready) {
    
	var sum;
	var indexbase, index;
	//experimental; added leaky integration on each note; also, only add to sum if harmonic, i.e., not a transient
    
	var weights = self.m_weights;
	var bins = self.m_bins;
        
    var fftbuf = self.stft.powers;
    
    //update fftbuf based on tonal vs percussive, zero out bin energy of percussive (e.g. more vertical)
    //bins only dealt with below 1024 anyway, so no need to go higher in checks
 
    var previousfftdataoffset = self.previousfftdatapointer * 1024;
    
    var vertical = 0;
    var horizontal = 0;
    
    for (i=self.halfnumpreviousframes; i<1024; ++i) {
        
        self.previousfftdata[previousfftdataoffset+i] = fftbuf[i];
    
        horizontal = 0;
        
        for (j=0; j<self.numpreviousframes; ++j) {
            
            horizontal += self.previousfftdata[j*1024+i];
            
        }
        
        vertical = 0;
        
        for (j=(i-self.lower); j<=(i+self.upper); ++j) {
            
            vertical += fftbuf[j];
            
        }
        
        if(vertical>horizontal) {
            
            fftbuf[i] = 0;
            
        }
        
    }
    
    self.previousfftdatapointer = (self.previousfftdatapointer+1)%self.numpreviousframes;

	//update for new round; leaky integration
	for (i=0;i<12;++i)
		self.chroma[i] *= self.chromaleak;
    
	for (i=0;i<60;++i) {
		var chromaindex = (i+9)%12; //starts at A1 up to G#6
        
		sum = 0.0;
        
		indexbase = 12*i; //6 partials, 2 of each
        
		for(j=0;j<12;++j) { //12 if 144 data points
            
			index=indexbase+j;
            
			sum+= (weights[index])* (fftbuf[bins[index]]);
		}
        
        self.chroma[chromaindex]+= sum;
	}
    
	var key = self.m_key;
    
	//major
	for (i=0;i<12;++i) {
        
		sum = 0.0;
        
		for (j=0;j<3;++j) {
			indexbase = self.g_major[j];
            
			index = (i+indexbase)%12;
			//sum+=(chroma[index]*g_kkmajor[indexbase]);
            
			sum += self.chroma[index] * self.g_diatonicmajor[indexbase];
            
		}
        
		key[i] = sum; //10*log10(sum+1);
	}
    
	//minor
	for (i=0;i<12;++i) {
        
		sum = 0.0;
        
		for (j=0;j<3;++j) {
			
            indexbase = self.g_minor[j];
            
			index = (i+indexbase)%12;
			//sum+=(chroma[index]*g_kkminor[indexbase]);
            
			sum += self.chroma[index]*self.g_diatonicminor[indexbase];
            
		}
        
		key[12+i] = sum;
	}
 
	//keyleak in seconds, convert to drop time in FFT hop frames (FRAMEPERIOD)
    var testmax = self.keydecay/self.m_frameperiod;
	
    var keyleak = testmax>0.001 ? testmax : 0.001; //FRAMEPERIOD;
    
	//now number of frames, actual leak param is decay exponent to reach 0.01 in x seconds, ie 0.01 = leakparam ** (x/ffthopsize)
	//0.01 is -40dB
	keyleak = Math.pow(0.01,(1/keyleak));
    
	var histogram = self.m_histogram;
    
	var bestchord = 0;
	var bestscore = 0;
    
	for (i=0;i<24;++i) {
		histogram[i] = (keyleak*histogram[i])+key[i];
        
		if(histogram[i]>bestscore) {
			bestscore = histogram[i];
			bestchord = i;
		}
        
        //printf("%f ",histogram[i]);
	}
    
	//should find secondbest and only swap if win by a margin
    
	//printf(" best %d \n\n",bestkey);
	//what is winning currently? find max in histogram
    
	self.chord = bestchord;
    
    //return self.m_currentKey;
    
    }
    
    return self.chord;
    
  }


}


//Nick Collins 13/6/05 onset detection MIREX algorithm (adapted from SC3 UGen for stream based calculation)
//C code version Nick Collins 20 May 2005
//js version 2018
//trying to implement the best onset detection algo from AES118 paper, with event analysis data to be written to a buffer
//for potential NRT and RT use
//stores up to a second of audio, assumes that events are not longer than that minus a few FFT frames
//assumes 44100 SR and FFT of 1024, 512 overlap



//assumes sampling rate 44.1kHz
//assumes blocksizes itself?
//function OnsetDetector(N,SR)


function MMLLOnsetDetector(sampleRate,threshold=0.34) {
    
    var self = this; 
    //helpful constants

    //assumes fixed sampling rate
    //FFT data
    self.N = 1024
    self.NOVER2 = 512
//    self.OVERLAP = 512
//    self.OVERLAPINDEX = 512
//    self.HOPSIZE = 512
//    self.FS = 44100
//    self.FRAMESR = 172.2656
//    self.FRAMEPERIOD = 0.00581
//    
    self.NUMERBBANDS = 40;
    self.PASTERBBANDS = 3;
    //3 usually, but time resolution improved if made 1?
    
    //in FFT frames
    //self.MAXEVENTDUR 80;
    self.MINEVENTDUR = 3;
    //4 or maybe 2
    
    //7 frames is about 40 mS
    //peak picker will use 3 back, 3 forward
    self.DFFRAMESSTORED = 7;
    
//    self.MAXBLOCKSIZE = 64;
//    self.MAXBLOCKS = 700;


    
	//time positions
	//var m_frame;
	//var m_lastdetect;
	
	//loudness measure
	self.m_loudbands = new Array(self.NUMERBBANDS); //[NUMERBBANDS][PASTERBBANDS]; //stores previous loudness bands
	//var m_pasterbbandcounter;
    self.m_df = new Float64Array(self.DFFRAMESSTORED);
	//self.m_dfcounter;
	
	//recording state
	//self.m_onsetdetected;

//[43]
self.eqlbandbins = [1,2,3,4,5,6,7,8,9,11,13,15,17,19,22,25,28,32,36,41,46,52,58,65,73,82,92,103,116,129,144,161,180,201,225,251,280,312,348,388,433,483,513];
//[42]
    //last entry was 30, corrected to 29 to avoid grabbing nyquist value, only half fftsize bins actually calculated for power
    //safe anyway since only 40 ERB bands used
self.eqlbandsizes = [1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,4,4,5,5,6,6,7,8,9,10,11,13,13,15,17,19,21,24,26,29,32,36,40,45,50,29];

//[42][11]
self.contours = [[ 47.88, 59.68, 68.55, 75.48, 81.71, 87.54, 93.24, 98.84,104.44,109.94,115.31],[ 29.04, 41.78, 51.98, 60.18, 67.51, 74.54, 81.34, 87.97, 94.61,101.21,107.74],[ 20.72, 32.83, 43.44, 52.18, 60.24, 67.89, 75.34, 82.70, 89.97, 97.23,104.49],[ 15.87, 27.14, 37.84, 46.94, 55.44, 63.57, 71.51, 79.34, 87.14, 94.97,102.37],[ 12.64, 23.24, 33.91, 43.27, 52.07, 60.57, 68.87, 77.10, 85.24, 93.44,100.90],[ 10.31, 20.43, 31.03, 40.54, 49.59, 58.33, 66.89, 75.43, 83.89, 92.34,100.80],[  8.51, 18.23, 28.83, 38.41, 47.65, 56.59, 65.42, 74.16, 82.89, 91.61,100.33],[  7.14, 16.55, 27.11, 36.79, 46.16, 55.27, 64.29, 73.24, 82.15, 91.06, 99.97],[  5.52, 14.58, 25.07, 34.88, 44.40, 53.73, 62.95, 72.18, 81.31, 90.44, 99.57],[  3.98, 12.69, 23.10, 32.99, 42.69, 52.27, 61.66, 71.15, 80.54, 89.93, 99.31],[  2.99, 11.43, 21.76, 31.73, 41.49, 51.22, 60.88, 70.51, 80.11, 89.70, 99.30],[  2.35, 10.58, 20.83, 30.86, 40.68, 50.51, 60.33, 70.08, 79.83, 89.58, 99.32],[  2.05, 10.12, 20.27, 30.35, 40.22, 50.10, 59.97, 69.82, 79.67, 89.52, 99.38],[  2.00,  9.93, 20.00, 30.07, 40.00, 49.93, 59.87, 69.80, 79.73, 89.67, 99.60],[  2.19, 10.00, 20.00, 30.00, 40.00, 50.00, 59.99, 69.99, 79.98, 89.98, 99.97],[  2.71, 10.56, 20.61, 30.71, 40.76, 50.81, 60.86, 70.96, 81.01, 91.06,101.17],[  3.11, 11.05, 21.19, 31.41, 41.53, 51.64, 61.75, 71.95, 82.05, 92.15,102.33],[  2.39, 10.69, 21.14, 31.52, 41.73, 51.95, 62.11, 72.31, 82.46, 92.56,102.59],[  1.50, 10.11, 20.82, 31.32, 41.62, 51.92, 62.12, 72.32, 82.52, 92.63,102.56],[ -0.17,  8.50, 19.27, 29.77, 40.07, 50.37, 60.57, 70.77, 80.97, 91.13,101.23],[ -1.80,  6.96, 17.77, 28.29, 38.61, 48.91, 59.13, 69.33, 79.53, 89.71, 99.86],[ -3.42,  5.49, 16.36, 26.94, 37.31, 47.61, 57.88, 68.08, 78.28, 88.41, 98.39],[ -4.73,  4.38, 15.34, 25.99, 36.39, 46.71, 57.01, 67.21, 77.41, 87.51, 97.41],[ -5.73,  3.63, 14.74, 25.48, 35.88, 46.26, 56.56, 66.76, 76.96, 87.06, 96.96],[ -6.24,  3.33, 14.59, 25.39, 35.84, 46.22, 56.52, 66.72, 76.92, 87.04, 97.00],[ -6.09,  3.62, 15.03, 25.83, 36.37, 46.70, 57.00, 67.20, 77.40, 87.57, 97.68],[ -5.32,  4.44, 15.90, 26.70, 37.28, 47.60, 57.90, 68.10, 78.30, 88.52, 98.78],[ -3.49,  6.17, 17.52, 28.32, 38.85, 49.22, 59.52, 69.72, 79.92, 90.20,100.61],[ -0.81,  8.58, 19.73, 30.44, 40.90, 51.24, 61.52, 71.69, 81.87, 92.15,102.63],[  2.91, 11.82, 22.64, 33.17, 43.53, 53.73, 63.96, 74.09, 84.22, 94.45,104.89],[  6.68, 15.19, 25.71, 36.03, 46.25, 56.31, 66.45, 76.49, 86.54, 96.72,107.15],[ 10.43, 18.65, 28.94, 39.02, 49.01, 58.98, 68.93, 78.78, 88.69, 98.83,109.36],[ 13.56, 21.65, 31.78, 41.68, 51.45, 61.31, 71.07, 80.73, 90.48,100.51,111.01],[ 14.36, 22.91, 33.19, 43.09, 52.71, 62.37, 71.92, 81.38, 90.88,100.56,110.56],[ 15.06, 23.90, 34.23, 44.05, 53.48, 62.90, 72.21, 81.43, 90.65, 99.93,109.34],[ 15.36, 23.90, 33.89, 43.31, 52.40, 61.42, 70.29, 79.18, 88.00, 96.69,105.17],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70]];
//[11]
self.phons = [2,10,20,30,40,50,60,70,80,90,100];

//empirically determined default value
self.threshold = threshold;

    



self.setup = function(sampleRate) {
	var i,j;
	
	
	////////time positions//////////
    //frames were in 64 sample blocks... no longer, now 512/64 = 8
	self.m_frame=0;
	self.m_lastdetect=-100;
	
    
    
    if(sampleRate >= (44100*2)) {
        
        self.stft = new MMLLSTFT(self.N * 2,self.NOVER2 * 2,1); // 1 = Hann window
        
    } else {
        
        self.stft = new MMLLSTFT(self.N,self.NOVER2,1);
    }
    
	
	/////////loudness measure////////
	self.m_dfcounter=self.DFFRAMESSTORED-1;
	//zero loudness store 
	for(j=0;j<self.DFFRAMESSTORED;++j) {
		self.m_df[j]=0.0;
	}
	
    //self.m_loudbands = new Array(self.DFFRAMESSTORED); //[NUMERBBANDS][PASTERBBANDS];
    
	//zero previous specific loudness in Bark bands
	
    
    for(j=0;j<self.NUMERBBANDS;++j) {
        
        self.m_loudbands[j] = new Float64Array(self.PASTERBBANDS);
    
        for(i=0;i<self.PASTERBBANDS; ++i)
		{
			self.m_loudbands[j][i] = 0.0;
		}
    }
			
    self.m_pasterbbandcounter=0;
	
	self.m_onsetdetected=0;

	self.m_now=0;
	
}

    
    self.setup(sampleRate);

//must pass in fft data
self.next = function(input) {

    self.m_onsetdetected=0;
    
    var ready = self.stft.next(input);
    
    if(ready) {
        
    //FFT result analysis
    var fftbuf = self.stft.powers;
    
    //HAVE BEEN PASSED FFT POWERS RESULT
    self.m_frame = self.m_frame+1;
    
	//calculate loudness detection function
	self.calculatedf(fftbuf);
	
	//use detection function
	self.peakpickdf();
    
    }
    
    //1 if onset detected self cycle
    return self.m_onsetdetected;
    
//	if(self.m_onsetdetected) {
//		
//        //DO SOMETHING! how communicated back? By return value
//        
//		//printf("onset detected %d \n",(self.m_onsetdetected));
//		
//		//if(self.m_triggerid) SendTrigger(&self.mParent->mNode, self.m_triggerid, self.m_loudness);
//		
//		self.m_onsetdetected=0;
//		
//	}
}


	
//    // Look at the real signal as an interleaved complex vector by casting it.
//    // Then call the transformation function ctoz to get a split complex vector,
//    // which for a real signal, divides into an even-odd configuration.
//    vDSP_ctoz ((COMPLEX *) fftbuf, 2, &self.m_vA, 1, NOVER2);
//	
//    // Carry out a Forward FFT transform
//    vDSP_fft_zrip(self.m_vsetup, &self.m_vA, 1, self.m_vlog2n, FFT_FORWARD);
//	
//    // The output signal is now in a split real form.  Use the function
//    // ztoc to get a split real vector.
//    vDSP_ztoc ( &self.m_vA, 1, (COMPLEX *) fftbuf, 2, NOVER2);
//	
//	// Squared Absolute so get power
//	for (i=0; i<N; i+=2)
//		//i>>1 is i/2 
//		fftbuf[i>>1] = (fftbuf[i] * fftbuf[i]) + (fftbuf[i+1] * fftbuf[i+1]);
//	

    
//should take fft data
self.calculatedf = function(fftbuf) {
	
	var h, j,k;
	
    //TO SORT
	//float * fftbuf= self.m_FFTBuf;
	
	var dfsum=0.0;
	
	var pastband = self.m_pasterbbandcounter;
	
    var bandstart, bandsize, bsum;
    
    var db, prop, lastloud, diff;
    
	for (k=0; k<self.NUMERBBANDS; ++k){
		
		bandstart = self.eqlbandbins[k];
		//int bandend=eqlbandbins[k+1];
		bandsize = self.eqlbandsizes[k];
		
		bsum = 0.0;
		
		for (h=0; h<bandsize;++h) {
			bsum = bsum+fftbuf[h+bandstart];  //SORT
		}
		
		//store recips of bandsizes?
		bsum = bsum/bandsize;
		
		//into dB, avoid log of 0
		//float db= 10*log10((bsum*10 000 000)+0.001);
		//db = 10*Math.log10((bsum*32382)+0.001);
        
        //empirically determined. If FFT max magnitudes around 512 (half 1024) say (though rarely would see anything max out at all, might see 5 in a band!)
        
        //(10**11)/(512**2)
        db = 10*Math.log10((bsum*381469.7265625)+0.001);
        
        
        
        //near halfway ERB
//        if(k==20) {
//            console.log("db", db, "bsum", bsum, "fftval",fftbuf[bandstart]);
//            
//        }
		
		//printf("bsum %f db %f \n",bsum,db);
		
		//convert via contour
		if(db<self.contours[k][0]) db=0;
        else if (db>self.contours[k][10]) db=self.phons[10];
        else {
            
            prop = 0.0;
			
            for (j=1; j<11; ++j) {
                if(db<self.contours[k][j]) {
                    prop = (db-self.contours[k][j-1])/(self.contours[k][j]-self.contours[k][j-1]);
                    break;
				}
				
				if(j==10) 
					prop = 1.0;
            }
			
            db = (1.0-prop)*self.phons[j-1]+ prop*self.phons[j];
			//printf("prop %f db %f j %d\n",prop,db,j);
			
		}
		
		//float lastloud=self.m_loudbands[k];
        lastloud = 0.0;
		
		for(j=0;j<self.PASTERBBANDS; ++j)
			lastloud += self.m_loudbands[k][j];
		
		lastloud /= self.PASTERBBANDS;
		
        diff = db-lastloud;
        
        if(diff<0.0) diff = 0.0;
        
        //sc_max(db-lastloud,0.0);
		
		dfsum = dfsum+diff; //(bweights[k]*diff);
		
		self.m_loudbands[k][pastband] = db;
	}
	
	self.m_pasterbbandcounter = (pastband+1)%self.PASTERBBANDS;
	
	//increment first so self frame is self.m_dfcounter
	self.m_dfcounter = (self.m_dfcounter+1)%self.DFFRAMESSTORED;
	
	self.m_df[self.m_dfcounter] = dfsum*0.025; //divide by num of bands to get a dB answer
	
	//printf("loudness %f %f \n",self.loudness[self.loudnesscounter], lsum);

}


//score rating peak picker
self.peakpickdf = function() {
	var i;
	
	//smoothed already with df looking at average of previous values
	var dfnow = self.m_dfcounter+self.DFFRAMESSTORED;
	
	//rate the peak in the central position
	
	var dfassess = ((dfnow-3)%self.DFFRAMESSTORED)+self.DFFRAMESSTORED;
	
	//look at three either side
	
	var pos;
	var val;
	
	var centreval = self.m_df[dfassess%self.DFFRAMESSTORED];
	
	//must normalise 
	//printf("centreval %f \n",centreval);
	
	var score = 0.0;
	
    
    //console.log("centreval",centreval, dfnow, dfassess);
    
    
	for (i=(-3); i<4; ++i) {
		pos = (dfassess+i)%self.DFFRAMESSTORED;
		
		val = centreval-(self.m_df[pos]);
		
		if(val<0) val*=10; //exacerbate negative evidence
		
		score = score+val;
	}
	
    //MIREX detector
	//normalise such that df max assumed at 50, 0.02
	
    //SC UGen
	//normalise such that df max assumed at 200, 0.005, was 50, 0.02

    
	score *= 0.02; 
	
	//if enough time since last detection
	if((self.m_frame-self.m_lastdetect)>=self.MINEVENTDUR) {
		
		//SIMPLE THRESHOLDING PEAKPICKER
		//var threshold = 0.34; //ZIN0(2); //0.34 best in trials
		
		//printf("threshold %f score %f \n",threshold, score);
		
        //console.log("peakpick",score,self.threshold);
        
		if(score>=self.threshold) {
			self.m_lastdetect = self.m_frame;
			
			self.m_onsetdetected = 1;
		
			
		}
	}
}

}



//Nick Collins 22/06/18 adapted from SC UGen in sc3-plugins
//based on V Hohmann Frequency analysis and synthesis using a Gammatone filterbank Acta Acustica vol 88 (2002): 433--442
//converted to straight struct form for SuperCollider from my own GammatoneComplexBandpass class code

function MMLLGammatone(samplingrate=44100) {
    
    var self = this; 
    //double precision where possible, use Float64

    self.samplingrate = samplingrate
    self.samplingperiod = 1.0/samplingrate;
	self.nyquist = samplingrate*0.5;
	
 
self.setup = function(centrefrequency,bandwidth) {
	var i,j;
    
	if (centrefrequency< 20.0) centrefrequency = 20.0;
	if (centrefrequency>self.nyquist) centrefrequency = self.nyquist;
	
	if ((centrefrequency-(0.5*bandwidth))<1.0) bandwidth = 2.0*(centrefrequency-1.0);

	if (bandwidth>self.nyquist) bandwidth = self.nyquist; //assuming there is even room!
 
	self.centrefrequency = centrefrequency;
	
	//actually need to convert ERBs to 3dB bandwidth
	bandwidth = 0.887*bandwidth; //converting to 3dB bandwith in Hz, 	//PH96 pg 3
	
	self.bandwidth = bandwidth;
	
	// filter coefficients to calculate, p.435 hohmann paper
	
	var beta = 6.2831853071796*self.centrefrequency*self.samplingperiod;
	var phi = 3.1415926535898*self.bandwidth*self.samplingperiod;
	var p =  (1.6827902832904*Math.cos(phi) -2)*6.3049771007832;
	var lambda = (p*(-0.5))-(Math.sqrt(p*p*0.25-1.0));
	
	self.reala = lambda*Math.cos(beta);
	self.imaga = lambda*Math.sin(beta);
	
	//avoid b= 0 or Nyquist, otherise must remove factor of 2.0 here
	self.normalisation= 2.0*(Math.pow(1-Math.abs(lambda),4));
	
	self.oldreal = [0,0,0,0]; //[4];
	self.oldimag = [0,0,0,0]; //[4];

}




    
//adapting zapgremlins from SC_InlineUnaryOp.h for denormal prevention
//see also similar algorithm in https://www.boost.org/doc/libs/1_51_0/boost/math/special_functions/fpclassify.hpp (used by CheckBadValues in SC)
self.next = function(input,output,numSamples) {

    var i,j;
    
    var newreal, newimag;
	
	var reala = self.reala;
	var imaga = self.imaga;
	var normalisation = self.normalisation;
	
    var absx;
    
	for (i=0; i<numSamples; ++i) {
		
		newreal = input[i]; //real input
		newimag = 0.0;
		
		for (j=0; j<4; ++j) {
			
			newreal = newreal + (reala*self.oldreal[j])-(imaga*self.oldimag[j]);
			newimag = newimag + (reala*self.oldimag[j])+(imaga*self.oldreal[j]);
			
			self.oldreal[j] = newreal; //zapgremlins(newreal); //trying to avoid denormals which mess up processing via underflow
			self.oldimag[j] = newimag; //zapgremlins(newimag);
            
            absx = Math.abs(newreal);
            
            //return (absx > (float32)1e-15 && absx < (float32)1e15) ? x : (float32)0.;
            self.oldreal[j] = (absx > 1e-15 && absx < 1e15) ? newreal : 0.;
            
            absx = Math.abs(newimag);
            
            self.oldimag[j] = (absx > 1e-15 && absx < 1e15) ? newimag : 0.;
            
            
		}
		
		output[i] = newreal*normalisation;
		
		//imaginary output too could be useful
		
	}

    
}

}





//Nick Collins 22/06/18 adapted from HairCell SC UGen in sc3-plugins


function MMLLHairCell(samplingrate=44100) {
    
    var self = this;
    
    self.samplingrate = samplingrate
    
    self.dt = 1.0/self.samplingrate;
    //gain=0.5;
    self.loss=0.99;
    //loss2=0.9;
    
    self.store = 1.0;
    self.minflow = 0.0; //(1.0/0.01)*dt;	//no spontaneous firing
    self.restoreflow = (1.0/0.001)*self.dt;
    self.feedflow = (self.restoreflow-self.minflow)*2.8284271247462; //2 times root 2, because rectification means effective only half a cycle, and RMS of 1/root2 must be compensated for
    
    //firingdelay= (int) (samplingrate*0.01); //(int) (samplingrate*0.001);
    //countsincelastfired=1;
    
    self.level = 0.0;
    self.outputlevel = 0.0;
    
    
    self.updateminflow = function(minflow=0) {
        if(minflow<0) minflow = 0;
		if(minflow>20000) minflow = 20000;
		
        self.minflow = self.dt*2.8284271247462*minflow; //compensation for half cycle and RMS
    }
    
    self.updatefeedflow = function(feedflow=200) {
        if(feedflow<0) feedflow = 0;
		if(feedflow>20000) feedflow = 20000;
		
        self.feedflow = self.dt*2.8284271247462*feedflow;
    }
    
    self.updaterestoreflow = function(restoreflow=1000) {
        if(restoreflow<0) restoreflow = 0;
		if(restoreflow>20000) restoreflow = 20000;
		
        self.restoreflow = self.dt*restoreflow;
    }
    
    self.updateloss = function(loss=0) {
        if(loss<0) loss = 0;
		if(loss>1) loss = 1;
		
        self.loss = loss;
    }
    
    self.update = function(minflow=0,feedflow=200,restoreflow=1000,loss=0.99) {
		
        self.updateminflow(minflow);
        self.updatefeedflow(feedflow);
        self.updaterestoreflow(restoreflow);
        self.updateloss(loss);
 
    }
    
    self.next = function(input,output,numSamples) {
        
        var i;
        var latest;
        var newflow;
        
        for (i=0; i<numSamples; ++i) {
            
            latest = input[i];
            
            //halfwave rectification and potential nonlinearity
            if(latest<0.0) latest=0.0;
            //else latest= latest; //sqrt(latest); //*latest; //or square root, or whatever
            
            newflow = self.minflow+(self.feedflow*latest);
            
            if(newflow>self.store) newflow = self.store;
            
            //if enough transmitter available
            self.store -= newflow;
            
            if(self.store<0.0) self.store = 0.0;
            
            self.level += newflow;
            
            if(self.level>1.0){
                
                //assuming 100 Hz resting rate
                self.outputlevel = 1.0; //could make peak dependent on how long it took it get there
                
                self.level = 0.0; //hair cell wiped out
                
            }
            
            self.store += self.restoreflow;
            
            output[i] = self.outputlevel;
            
            self.outputlevel *= self.loss;
            
        }
        
        
    }
    
}





//onset detection function as used in MMLLOnsetDetector
//assumes sampling rate 44.1kHz


function MMLLBeatTrackerFastReact(sampleRate,threshold=0.34) {
    
    var self = this; 
    
    //helpful constants

    //assumes fixed sampling rate
    //FFT data
    self.N = 1024
    self.NOVER2 = 512

    self.NUMERBBANDS = 40;
    self.PASTERBBANDS = 3;
    //3 usually, but time resolution improved if made 1?
    
    //in FFT frames
    //self.MAXEVENTDUR 80;
    self.MINEVENTDUR = 3;
    //4 or maybe 2
    
    //7 frames is about 40 mS
    //peak picker will use 3 back, 3 forward
    self.DFFRAMESSTORED = 7;

	//loudness measure
	self.m_loudbands = new Array(self.NUMERBBANDS); //[NUMERBBANDS][PASTERBBANDS]; //stores previous loudness bands
	//var m_pasterbbandcounter;
    self.m_df = new Float64Array(self.DFFRAMESSTORED);
	//self.m_dfcounter;
	
	//recording state
	//self.m_onsetdetected;

//[43]
self.eqlbandbins = [1,2,3,4,5,6,7,8,9,11,13,15,17,19,22,25,28,32,36,41,46,52,58,65,73,82,92,103,116,129,144,161,180,201,225,251,280,312,348,388,433,483,513];
//[42]
    //last entry was 30, corrected to 29 to avoid grabbing nyquist value, only half fftsize bins actually calculated for power
    //safe anyway since only 40 ERB bands used
self.eqlbandsizes = [1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,4,4,5,5,6,6,7,8,9,10,11,13,13,15,17,19,21,24,26,29,32,36,40,45,50,29];

//[42][11]
self.contours = [[ 47.88, 59.68, 68.55, 75.48, 81.71, 87.54, 93.24, 98.84,104.44,109.94,115.31],[ 29.04, 41.78, 51.98, 60.18, 67.51, 74.54, 81.34, 87.97, 94.61,101.21,107.74],[ 20.72, 32.83, 43.44, 52.18, 60.24, 67.89, 75.34, 82.70, 89.97, 97.23,104.49],[ 15.87, 27.14, 37.84, 46.94, 55.44, 63.57, 71.51, 79.34, 87.14, 94.97,102.37],[ 12.64, 23.24, 33.91, 43.27, 52.07, 60.57, 68.87, 77.10, 85.24, 93.44,100.90],[ 10.31, 20.43, 31.03, 40.54, 49.59, 58.33, 66.89, 75.43, 83.89, 92.34,100.80],[  8.51, 18.23, 28.83, 38.41, 47.65, 56.59, 65.42, 74.16, 82.89, 91.61,100.33],[  7.14, 16.55, 27.11, 36.79, 46.16, 55.27, 64.29, 73.24, 82.15, 91.06, 99.97],[  5.52, 14.58, 25.07, 34.88, 44.40, 53.73, 62.95, 72.18, 81.31, 90.44, 99.57],[  3.98, 12.69, 23.10, 32.99, 42.69, 52.27, 61.66, 71.15, 80.54, 89.93, 99.31],[  2.99, 11.43, 21.76, 31.73, 41.49, 51.22, 60.88, 70.51, 80.11, 89.70, 99.30],[  2.35, 10.58, 20.83, 30.86, 40.68, 50.51, 60.33, 70.08, 79.83, 89.58, 99.32],[  2.05, 10.12, 20.27, 30.35, 40.22, 50.10, 59.97, 69.82, 79.67, 89.52, 99.38],[  2.00,  9.93, 20.00, 30.07, 40.00, 49.93, 59.87, 69.80, 79.73, 89.67, 99.60],[  2.19, 10.00, 20.00, 30.00, 40.00, 50.00, 59.99, 69.99, 79.98, 89.98, 99.97],[  2.71, 10.56, 20.61, 30.71, 40.76, 50.81, 60.86, 70.96, 81.01, 91.06,101.17],[  3.11, 11.05, 21.19, 31.41, 41.53, 51.64, 61.75, 71.95, 82.05, 92.15,102.33],[  2.39, 10.69, 21.14, 31.52, 41.73, 51.95, 62.11, 72.31, 82.46, 92.56,102.59],[  1.50, 10.11, 20.82, 31.32, 41.62, 51.92, 62.12, 72.32, 82.52, 92.63,102.56],[ -0.17,  8.50, 19.27, 29.77, 40.07, 50.37, 60.57, 70.77, 80.97, 91.13,101.23],[ -1.80,  6.96, 17.77, 28.29, 38.61, 48.91, 59.13, 69.33, 79.53, 89.71, 99.86],[ -3.42,  5.49, 16.36, 26.94, 37.31, 47.61, 57.88, 68.08, 78.28, 88.41, 98.39],[ -4.73,  4.38, 15.34, 25.99, 36.39, 46.71, 57.01, 67.21, 77.41, 87.51, 97.41],[ -5.73,  3.63, 14.74, 25.48, 35.88, 46.26, 56.56, 66.76, 76.96, 87.06, 96.96],[ -6.24,  3.33, 14.59, 25.39, 35.84, 46.22, 56.52, 66.72, 76.92, 87.04, 97.00],[ -6.09,  3.62, 15.03, 25.83, 36.37, 46.70, 57.00, 67.20, 77.40, 87.57, 97.68],[ -5.32,  4.44, 15.90, 26.70, 37.28, 47.60, 57.90, 68.10, 78.30, 88.52, 98.78],[ -3.49,  6.17, 17.52, 28.32, 38.85, 49.22, 59.52, 69.72, 79.92, 90.20,100.61],[ -0.81,  8.58, 19.73, 30.44, 40.90, 51.24, 61.52, 71.69, 81.87, 92.15,102.63],[  2.91, 11.82, 22.64, 33.17, 43.53, 53.73, 63.96, 74.09, 84.22, 94.45,104.89],[  6.68, 15.19, 25.71, 36.03, 46.25, 56.31, 66.45, 76.49, 86.54, 96.72,107.15],[ 10.43, 18.65, 28.94, 39.02, 49.01, 58.98, 68.93, 78.78, 88.69, 98.83,109.36],[ 13.56, 21.65, 31.78, 41.68, 51.45, 61.31, 71.07, 80.73, 90.48,100.51,111.01],[ 14.36, 22.91, 33.19, 43.09, 52.71, 62.37, 71.92, 81.38, 90.88,100.56,110.56],[ 15.06, 23.90, 34.23, 44.05, 53.48, 62.90, 72.21, 81.43, 90.65, 99.93,109.34],[ 15.36, 23.90, 33.89, 43.31, 52.40, 61.42, 70.29, 79.18, 88.00, 96.69,105.17],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70]];
//[11]
self.phons = [2,10,20,30,40,50,60,70,80,90,100];

//empirically determined default value
self.threshold = threshold;

    
//beat tracking code
    
    self.numperiods_ = 100;
    self.numpreviousvalues_= 350;
    self.storepos_ = 0;
    self.store_ = new Array(self.numpreviousvalues_);
    self.crosscomby_ = new Array(self.numperiods_);
	
    self.calcperiod_ = 86;
    self.calccounter_ = 0;
    self.amortcounter_ = 0;
    
    self.halftrigdone_= 0;
    self.quartertrigdone_= 0;
    self.threequarterstrigdone_= 0;
    
    var i; //reusable loop counter
    
    for (i=0; i<self.numpreviousvalues_; ++i)
        self.store_[i] = 0.0;
    
    for (i=0; i<self.numperiods_; ++i)
        self.crosscomby_[i] = 0.0;
    
    self.trigger_ = 0;
    
    self.prevbestperiod_ = 50;
    //self.prevbestphase_ = 0;
    self.period_= 50.0;
    self.periodi_ = -1;
    self.phase_ = 0.0;
    self.phasechange_ = 0.0;
    self.periodinsamples_ = 512* self.period_;
    self.phasenowinsamples_= 0;
    self.lastphaseestimate_= 0;
    self.lastperiodestimate_= 50.0;
    
    
    
    //assumes 512 hop size, [100]
    self.g_periods = [ 57.421875, 56.84765625, 56.284808168317, 55.732996323529, 55.191899271845, 54.661207932692, 54.140625, 53.629864386792, 53.128650700935, 52.63671875, 52.153813073394, 51.6796875, 51.21410472973, 50.7568359375, 50.30766039823, 49.866365131579, 49.432744565217, 49.006600215517, 48.587740384615, 48.175979872881, 47.771139705882, 47.373046875, 46.981534090909, 46.59643954918, 46.217606707317, 45.844884072581, 45.478125, 45.1171875, 44.761934055118, 44.412231445313, 44.067950581395, 43.728966346154, 43.395157442748, 43.06640625, 42.742598684211, 42.423624067164, 42.109375, 41.799747242647, 41.49463959854, 41.193953804348, 40.89759442446, 40.60546875, 40.317486702128, 40.033560739437, 39.753605769231, 39.4775390625, 39.205280172414, 38.936750856164, 38.671875, 38.410578547297, 38.15278942953, 37.8984375, 37.647454470199, 37.399773848684, 37.155330882353, 36.9140625, 36.675907258065, 36.440805288462, 36.208698248408, 35.979529272152, 35.753242924528, 35.52978515625, 35.30910326087, 35.091145833333, 34.875862730061, 34.663205030488, 34.453125, 34.245576054217, 34.040512724551, 33.837890625, 33.637666420118, 33.439797794118, 33.244243421053, 33.050962936047, 32.859916907514, 32.671066810345, 32.484375, 32.2998046875, 32.117319915254, 31.936885533708, 31.758467178771, 31.58203125, 31.407544889503, 31.234975961538, 31.064293032787, 30.895465353261, 30.728462837838, 30.563256048387, 30.399816176471, 30.238115026596, 30.078125, 29.919819078947, 29.763170811518, 29.608154296875, 29.454744170984, 29.302915592784, 29.152644230769, 29.00390625, 28.856678299492, 28.7109375 ];
    //int g_periodsnext[100] =[ 57, 56, 56, 55, 55, 54, 54, 53, 53, 52, 52, 51, 51, 50, 50, 49, 49, 49, 48, 48, 47, 47, 46, 46, 46, 45, 45, 45, 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, 40, 40, 40, 40, 39, 39, 39, 38, 38, 38, 38, 37, 37, 37, 37, 36, 36, 36, 36, 35, 35, 35, 35, 35, 34, 34, 34, 34, 34, 33, 33, 33, 33, 33, 32, 32, 32, 32, 32, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 29, 29, 29, 29, 29, 29, 29, 28, 28 ];
    [100]
    self.g_periodsprev = [ 58, 57, 57, 56, 56, 55, 55, 54, 54, 53, 53, 52, 52, 51, 51, 50, 50, 50, 49, 49, 48, 48, 47, 47, 47, 46, 46, 46, 45, 45, 45, 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, 41, 40, 40, 40, 39, 39, 39, 39, 38, 38, 38, 38, 37, 37, 37, 37, 36, 36, 36, 36, 36, 35, 35, 35, 35, 35, 34, 34, 34, 34, 34, 33, 33, 33, 33, 33, 32, 32, 32, 32, 32, 32, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30, 29, 29 ];
    
    //[100]
    self.g_periods1minusinterp = [ 0.421875, 0.84765625, 0.28480816831684, 0.73299632352941, 0.19189927184466, 0.66120793269231, 0.140625, 0.62986438679246, 0.12865070093459, 0.63671875000001, 0.1538130733945, 0.67968750000001, 0.21410472972973, 0.7568359375, 0.30766039823009, 0.86636513157895, 0.43274456521739, 0.0066002155172455, 0.58774038461539, 0.17597987288136, 0.77113970588236, 0.37304687500001, 0.98153409090909, 0.59643954918033, 0.21760670731709, 0.84488407258065, 0.47812500000001, 0.11718750000001, 0.76193405511812, 0.41223144531251, 0.067950581395358, 0.72896634615385, 0.39515744274809, 0.066406250000007, 0.74259868421054, 0.42362406716418, 0.10937500000001, 0.79974724264707, 0.49463959854016, 0.19395380434784, 0.89759442446044, 0.60546875000001, 0.31748670212767, 0.033560739436631, 0.75360576923078, 0.47753906250001, 0.20528017241381, 0.93675085616439, 0.67187500000001, 0.41057854729731, 0.15278942953022, 0.89843750000001, 0.64745447019869, 0.39977384868422, 0.15533088235295, 0.91406250000001, 0.67590725806453, 0.44080528846155, 0.20869824840766, 0.97952927215191, 0.75324292452832, 0.52978515625001, 0.30910326086958, 0.091145833333343, 0.87586273006136, 0.66320503048782, 0.45312500000001, 0.24557605421688, 0.040512724550908, 0.83789062500001, 0.63766642011836, 0.43979779411766, 0.24424342105264, 0.050962936046524, 0.85991690751446, 0.67106681034484, 0.48437500000001, 0.29980468750001, 0.11731991525425, 0.93688553370788, 0.75846717877096, 0.58203125000001, 0.40754488950277, 0.23497596153847, 0.064293032786896, 0.89546535326088, 0.72846283783785, 0.56325604838711, 0.3998161764706, 0.23811502659576, 0.078125000000014, 0.91981907894738, 0.76317081151834, 0.60815429687501, 0.45474417098447, 0.30291559278352, 0.15264423076924, 0.0039062500000142, 0.8566782994924, 0.71093750000001 ];
    
    //[100]
    self.g_periodsinterp = [ 0.578125, 0.15234375, 0.71519183168316, 0.26700367647059, 0.80810072815534, 0.33879206730769, 0.859375, 0.37013561320754, 0.87134929906541, 0.36328124999999, 0.8461869266055, 0.32031249999999, 0.78589527027027, 0.2431640625, 0.69233960176991, 0.13363486842105, 0.56725543478261, 0.99339978448275, 0.41225961538461, 0.82402012711864, 0.22886029411764, 0.62695312499999, 0.018465909090907, 0.40356045081967, 0.78239329268291, 0.15511592741935, 0.52187499999999, 0.88281249999999, 0.23806594488188, 0.58776855468749, 0.93204941860464, 0.27103365384615, 0.60484255725191, 0.93359374999999, 0.25740131578946, 0.57637593283582, 0.89062499999999, 0.20025275735293, 0.50536040145984, 0.80604619565216, 0.10240557553956, 0.39453124999999, 0.68251329787233, 0.96643926056337, 0.24639423076922, 0.52246093749999, 0.79471982758619, 0.063249143835606, 0.32812499999999, 0.58942145270269, 0.84721057046978, 0.10156249999999, 0.35254552980131, 0.60022615131578, 0.84466911764705, 0.085937499999986, 0.32409274193547, 0.55919471153845, 0.79130175159234, 0.020470727848092, 0.24675707547168, 0.47021484374999, 0.69089673913042, 0.90885416666666, 0.12413726993864, 0.33679496951218, 0.54687499999999, 0.75442394578312, 0.95948727544909, 0.16210937499999, 0.36233357988164, 0.56020220588234, 0.75575657894736, 0.94903706395348, 0.14008309248554, 0.32893318965516, 0.51562499999999, 0.70019531249999, 0.88268008474575, 0.063114466292124, 0.24153282122904, 0.41796874999999, 0.59245511049723, 0.76502403846153, 0.9357069672131, 0.10453464673912, 0.27153716216215, 0.43674395161289, 0.6001838235294, 0.76188497340424, 0.92187499999999, 0.080180921052619, 0.23682918848166, 0.39184570312499, 0.54525582901553, 0.69708440721648, 0.84735576923076, 0.99609374999999, 0.1433217005076, 0.28906249999999 ];
    

    
  

self.setup = function(sampleRate) {
	var i,j;
	
	
	////////time positions//////////
    //frames were in 64 sample blocks... no longer, now 512/64 = 8
	self.m_frame=0;
	self.m_lastdetect=-100;
    
    if(sampleRate >= (44100*2)) {
        
        self.stft = new MMLLSTFT(self.N * 2,self.NOVER2 * 2,2); // 2 = sine window
        
    } else {
        
        self.stft = new MMLLSTFT(self.N,self.NOVER2,2);
    }
    
	
	/////////loudness measure////////
	self.m_dfcounter=self.DFFRAMESSTORED-1;
	//zero loudness store 
	for(j=0;j<self.DFFRAMESSTORED;++j) {
		self.m_df[j]=0.0;
	}
	
    //self.m_loudbands = new Array(self.DFFRAMESSTORED); //[NUMERBBANDS][PASTERBBANDS];
    
	//zero previous specific loudness in Bark bands
    for(j=0;j<self.NUMERBBANDS;++j) {
        
        self.m_loudbands[j] = new Float64Array(self.PASTERBBANDS);
    
        for(i=0;i<self.PASTERBBANDS; ++i)
		{
			self.m_loudbands[j][i] = 0.0;
		}
    }
			
    self.m_pasterbbandcounter=0;
	
	self.m_onsetdetected=0;

	self.m_now=0;
    
    
    
    
    
	
}

    
    self.setup(sampleRate);

//must pass in fft data
self.next = function(input) {

    var beat = 0;
    
    var ready = self.stft.next(input);
    
    if(ready) {
        
    //FFT result analysis
    var fftbuf = self.stft.powers;
    
    //HAVE BEEN PASSED FFT POWERS RESULT
    self.m_frame = self.m_frame+1;
    
	//calculate loudness detection function
	self.calculatedf(fftbuf);
	
        
    //now beat tracker code
        
  
        //just arrived =
        //self.m_df[self.m_dfcounter]
        
        beat = self.beattrackcalculation(self.m_df[self.m_dfcounter] * 0.01);

        //console.log('next1',beat,self.m_df[self.m_dfcounter] * 0.01);
        
    
    }
    
    //1 if beat detected self cycle
    return beat;
    
}
    
    
    self.beattrackcalculation = function(value) {
        
            
            var i, j, k;
            
            var prev, next;
            var prev2, next2;
            var interp;
        
        var beatresult = 0;
      
            self.phase_ += self.phasechange_;
            //lastphaseestimate_ += phasechange_;
            if(self.phase_ > self.period_) {
                self.phase_ -= self.period_;
                self.trigger_ = 1;
                beatresult = 1;
                
                
                //printf("beat %f %f \n", phase_, period_);
                
                
                self.halftrigdone_=0;
                self.quartertrigdone_=0;
                self.threequarterstrigdone_=0;
                
            } else {
                
                //trigger_ = 0;
                
                if((self.quartertrigdone_==0) && ((self.phase_*4.0)>self.period_)) {
                    
                    self.trigger_=2;
                    self.quartertrigdone_=1;
                }
                
                if((self.halftrigdone_==0) && ((2.0*self.phase_)>self.period_)) {
                    
                    self.trigger_=3;
                    self.halftrigdone_=1;
                }
                
                
                if((self.threequarterstrigdone_==0) && ((4.0*self.phase_)>(3.0*self.period_))) {
                    
                    self.trigger_=4;
                    self.threequarterstrigdone_=1;
                }
                
            }
            
            
            
            
            self.store_[self.storepos_] = value;
            
            //update leaky integrators
            for (i=0; i<self.numperiods_; ++i) {
                
                var periodtotest = self.g_periods[i];
                
                var sumup = 0.0;
                
                //sum up to previous four beats compared to now
                
                var basepos = ( self.storepos_ + self.numpreviousvalues_ );
                
                for (k=1; k<=4; ++k) {
       
                    var posthen = (basepos - (k*periodtotest))%self.numpreviousvalues_;
                    
                    prev = Math.floor(posthen);
                    next = (prev+1)%self.numpreviousvalues_;
                    
                    //THIS IS ALWAYS ZERO??????
                    interp = posthen-prev;
                    
                    sumup +=  value* ((self.store_[prev]*(1.0-interp)) + ((interp)*self.store_[next]));
       
                }
                
                
                
                //
                //			prev = ( storepos_ -  g_periodsprev[i] + numpreviousvalues_ ) % numpreviousvalues_;
                //
                //			next = ( prev + 1 ) % numpreviousvalues_;
                //
                //			//should also sum over four previous beats?
                //
                //			mult = value * ( (g_periods1minusinterp[i] * store_[prev]) + (g_periodsinterp[i] * store_[next]) );
                //					crosscomby_[i] = (crosscomby_[i] *0.996) + mult;
                
                
                //0.996
                self.crosscomby_[i] = (self.crosscomby_[i] *0.995) + sumup;
            }
            
            
            if (self.calccounter_ == self.calcperiod_) {
                
                self.lastphaseestimate_= (self.lastphaseestimate_ + self.calcperiod_)%self.lastperiodestimate_;
                
                var bestscore = 0.001;
                var secondbestscore = 0.001;
                var besti=0, secondi=0;
                
                //find best scoring crosscomby
                for (i=0; i<self.numperiods_; ++i) {
                    
                    var now = self.crosscomby_[i];
                    
                    if (now>bestscore) {
                        
                        if(bestscore>secondbestscore) {
                            
                            secondbestscore = bestscore;
                            secondi = besti;
                        }
                        
                        
                        bestscore  = now;
                        besti = i;
                        
                    } else if (now>secondbestscore) {
                        
                        
                        secondbestscore = now;
                        secondi = i;
                    }
                    
                    
                    
                    
                }
   
                
                //printf("checks %f %f best %d prevbest %d\n", bestscore, secondbestscore, besti, prevbestperiod_);
     
                
                var period = self.g_periods[besti];
                
                //printf("last period %f new period %f\n", period_, period);
                
                //int sameperiodflag = (periodi_ == besti)?1:0;
                
                //now have candidate tempo; check 20 possible phases.
                
                //( storepos_ -  (4*period) + numpreviousvalues_ ) % numpreviousvalues_;
                
                var phasediv = period/20.0;
                
                var bestphasescore = 0.0;
                var bestphase = 0.0;
                
                var bestphasej = 0;
                
                var basecalc =  self.storepos_ -  (4*period)  + self.numpreviousvalues_ ;
                
                //try 20 phases, summing over four beats
                for (j=0; j<20; ++j) {
                    
                    var basephasepos = (basecalc + (j*phasediv))%self.numpreviousvalues_;
                    
                    var summation = 0.0;
                    
                    for (k=0; k<4; ++k) {
                        
                        var phasenow = (basephasepos+ (k*period))%self.numpreviousvalues_;
                        
                        prev = phasenow;
                        next = (prev+1)%self.numpreviousvalues_;
                        
                        prev2 = prev>0?(prev-1):self.numpreviousvalues_;
                        next2 = (next+1)%self.numpreviousvalues_;
                        
                        interp = phasenow-prev;
                        
                        //summation +=  (store_[prev]*(1.0-interp)) + ((interp)*store_[next]);
                        summation +=  ((self.store_[prev]+self.store_[prev2])*(1.0-interp)) + ((interp)*(self.store_[next]+self.store_[next2]));
                        
                    }
                    
                    if(summation > bestphasescore) {
                        
                        bestphasescore = summation;
                        bestphasej = j;
                        bestphase = (basephasepos+ (3.0*period))%self.numpreviousvalues_;
                        
                    }
                    
                }
                
                //if two consistent estimates for phase in a row, then update phase; else get lots of skipped beats when phase clock resets mid flow
                
                var phaseestimate = (self.storepos_ - bestphase + self.numpreviousvalues_)%self.numpreviousvalues_;
                
                var phasedifference1 =  (phaseestimate - self.lastphaseestimate_ +period )%period;
                var phasedifference2 =  (self.lastphaseestimate_ - phaseestimate  +period )%period;
                var phasedifference = phasedifference1< phasedifference2?phasedifference1: phasedifference2;
                
                self.phasechange_ = 1.0;
              
                
                //printf("phase stringency %f %f diff %f\n", phaseestimate, lastphaseestimate_,phasedifference);
         
                
                //&& ((bestscore/secondbestscore)>1.1)
                
                
                if( Math.abs(besti-self.prevbestperiod_)<3.0 ) {
                    
                    if (phasedifference<(period*0.125)) { 
                        
                        self.periodi_ = besti;
                        
                        self.period_ = period; // * 512.0;
                        self.periodinsamples_ = 512* self.period_;
                        
                        self.phase_ = phaseestimate; //fmod( storepos_ - bestphase + numpreviousvalues_, numpreviousvalues_) ; //phase AT THIS POINT IN TIME
                        
                    }
                    
                } 
                
                
                self.lastphaseestimate_ = self.phase_;  //actually meaningless unless same period to compare
     
                //update if close enough
                
                self.prevbestperiod_ = besti;
                self.lastperiodestimate_ = period;
                
                self.calccounter_ = 0;
            }
            
            self.storepos_ = (self.storepos_ + 1)% self.numpreviousvalues_;
            
            ++self.calccounter_;
        
        return beatresult;
        
    }


	   
//should take fft data
self.calculatedf = function(fftbuf) {
	
	var h, j,k;
	
    //TO SORT
	//float * fftbuf= self.m_FFTBuf;
	
	var dfsum=0.0;
	
	var pastband = self.m_pasterbbandcounter;
	
    var bandstart, bandsize, bsum;
    
    var db, prop, lastloud, diff;
    
	for (k=0; k<self.NUMERBBANDS; ++k){
		
		bandstart = self.eqlbandbins[k];
		//int bandend=eqlbandbins[k+1];
		bandsize = self.eqlbandsizes[k];
		
		bsum = 0.0;
		
		for (h=0; h<bandsize;++h) {
			bsum = bsum+fftbuf[h+bandstart];  //SORT
		}
		
		//store recips of bandsizes?
		bsum = bsum/bandsize;
		
		//into dB, avoid log of 0
		//float db= 10*log10((bsum*10 000 000)+0.001);
		//db = 10*Math.log10((bsum*32382)+0.001);
        
        //empirically determined. If FFT max magnitudes around 512 (half 1024) say (though rarely would see anything max out at all, might see 5 in a band!)
        
        //(10**11)/(512**2)
        db = 10*Math.log10((bsum*381469.7265625)+0.001);
        
        
        
        //near halfway ERB
//        if(k==20) {
//            console.log("db", db, "bsum", bsum, "fftval",fftbuf[bandstart]);
//            
//        }
		
		//printf("bsum %f db %f \n",bsum,db);
		
		//convert via contour
		if(db<self.contours[k][0]) db=0;
        else if (db>self.contours[k][10]) db=self.phons[10];
        else {
            
            prop = 0.0;
			
            for (j=1; j<11; ++j) {
                if(db<self.contours[k][j]) {
                    prop = (db-self.contours[k][j-1])/(self.contours[k][j]-self.contours[k][j-1]);
                    break;
				}
				
				if(j==10) 
					prop = 1.0;
            }
			
            db = (1.0-prop)*self.phons[j-1]+ prop*self.phons[j];
			//printf("prop %f db %f j %d\n",prop,db,j);
			
		}
		
		//float lastloud=self.m_loudbands[k];
        lastloud = 0.0;
		
		for(j=0;j<self.PASTERBBANDS; ++j)
			lastloud += self.m_loudbands[k][j];
		
		lastloud /= self.PASTERBBANDS;
		
        diff = db-lastloud;
        
        if(diff<0.0) diff = 0.0;
        
        //sc_max(db-lastloud,0.0);
		
		dfsum = dfsum+diff; //(bweights[k]*diff);
		
		self.m_loudbands[k][pastband] = db;
	}
	
	self.m_pasterbbandcounter = (pastband+1)%self.PASTERBBANDS;
	
	//increment first so self frame is self.m_dfcounter
	self.m_dfcounter = (self.m_dfcounter+1)%self.DFFRAMESSTORED;
	
	self.m_df[self.m_dfcounter] = dfsum*0.025; //divide by num of bands to get a dB answer
	
	//printf("loudness %f %f \n",self.loudness[self.loudnesscounter], lsum);

}

    
}



//William Sethares sensory dissonance algorithm adapted from my SuperCollider SensoryDissonance UGen code
//Sensory Dissonance model, measuring roughness between pairs of prominent spectral peaks. Follows the algorithm in William A. Sethares (1998) Consonance-Based Spectral Mappings. CMJ 22(1): 56-72

function MMLLSensoryDissonance(sampleRate,fftsize=2048,maxpeaks=100,peakthreshold=0.1,norm,clamp=5) {
    
    var self = this; 
    
    self.setup = function(sampleRate,fftsize=2048,maxpeaks=100,peakthreshold=0.1,norm,clamp=5) {
        var i;
        
        self.m_srate = sampleRate;
        self.fftsize_ = fftsize;
        
        self.stft = new MMLLSTFT(self.fftsize_,self.fftsize_/2,2);
        
        //for(i=0; i<12; ++i)
        
        self.maxnumpeaks_ = maxpeaks; //100;
        self.peakthreshold_ = peakthreshold;
        self.peakfreqs_ =  new Array(self.maxnumpeaks_);
        self.peakamps_ = new Array(self.maxnumpeaks_);
        
        self.norm_ = (typeof norm !== 'undefined') ?  norm : 0.01/maxpeaks;
        
        self.clamp_ = clamp;
        
        self.topbin_= self.fftsize_*0.25;  //only go up to half the frequency range (i.e., there are half fftsize bins)
        self.frequencyperbin_ = self.m_srate / self.fftsize_;
        
        self.dissonance_ = 0;
        
    }
    
    self.setup(sampleRate,fftsize,maxpeaks,peakthreshold,norm,clamp);
    
    //must pass in fft data (power spectrum)
    self.next = function(input) {
        
        var i,j;
        
        var ready = self.stft.next(input);
        
        if(ready) {
            
            
            var fftbuf = self.stft.powers;
            
            
            var peakfreqs= self.peakfreqs_;
            var peakamps= self.peakamps_;
            
            var real, imag;
            
            var numpeaks = 0;
            var maxnumpeaks = self.maxnumpeaks_;
            
            var intensity;
            var position;
            
            var threshold = self.peakthreshold_;
            
            //create powerspectrum
            
            var prev=0.0, now=0.0, next=0.0;
            
            var frequencyperbin = self.frequencyperbin_;
            
            //float totalpeakpower = 0.0f;
            var temp1, refinement;
            
            for (j=1; j<=self.topbin_; ++j) {
                
                intensity = fftbuf[j];
                
                next = intensity;
                
                if(j>=3) {
                    
                    //hunt for peaks
                    
                    //look for peak by scoring within +-3
                    //assume peak must be centrally greater than 60dB say
                    
                    //powertest_
                    //minpeakdB_ was 60
                    
                    if (now>threshold)  {
                        
                        //y1= powerspectrum_[i-1];
                        //				//y2= valuenow;
                        //				y3= powerspectrum_[i+1];
                        //
                        if ((now>prev) && (now>next)) {
                            
                            //second peak condition; sum of second differences must be positive
                            //NCfloat testsum= (valuenow - powerspectrum_[i-2]) + (valuenow - powerspectrum_[i+2]);
                            
                            //if (testsum>0.0) {
                            
                            //refine estimate of peak using quadratic function
                            //see workbook 28th Jan 2010
                            
                            temp1 = prev+next-(2*now);
                            
                            if (Math.abs(temp1)>0.00001) {
                                position=(prev-next)/(2*temp1);
                                
                                //running quadratic formula
                                refinement = (0.5*temp1*(position*position)) + (0.5*(next-prev)*position) + now;
                                //refinement= y2 -  (((y3-y1)^2)/(8*temp1));
                                
                            } else {
                                //degenerate straight line case; shouldn't occur
                                //since require greater than for peak, not equality
                                
                                position=0.0; //may as well take centre
                                
                                //bettervalue= max([y1,y2,y3]); %straight line through them, find max
                                
                                refinement= now; //must be max for else would have picked another one in previous calculation! %max([y1,y2,y3]);
                                
                            }
                            
                            //correct??????????????????????????????
                            peakfreqs[numpeaks] = (j-1+position)*frequencyperbin; //frequencyconversion;
                            //printf("peakfrequencies %d is %f from i %d position %f freqperbin %f \n", numpeaks_,peakfrequencies_[numpeaks_],i, position, frequencyperbin_);
                            
                            peakamps[numpeaks] = Math.sqrt(refinement); //Sethares formula requires amplitudes
                            //totalpeakpower += refinement;
                            
                            //cout << " peak " << numpeaks_ << " " << peakfrequencies_[numpeaks_] << " " << refinement << " " ;
                            
                            ++numpeaks;
                            
                            //}
                            
                        }
                        
                    }
                    
                    //test against maxnumberpeaks_
                    if ( numpeaks == maxnumpeaks )
                        break;
                    
                    
                    
                }
                
                prev = now; now=next;
                
            }
            
            
            //now have list of peaks: calculate total dissonance:
            
            //iterate through peaks, matching each to min of next 10, and no more than octave, using Sethares p. 58 CMJ article
            
            var dissonancesum = 0;
            
            var f1, v1, f2, v2;
            var d;
            var diff; //, minf;
            var s, a, b;
            var octave;
            var upper;
            
            for (i=0; i<(numpeaks-1); ++i) {
                
                f1 = peakfreqs[i];
                v1 = peakamps[i];
                s = 0.24/(0.21*f1+19); //constant needed as denominator in formula
                a = -3.5*s;
                b= -5.75*s;
                
                octave = 2*f1;
                
                upper = i+20;
                
                if(upper>numpeaks) upper = numpeaks;
                
                for (j=i+1; j<upper; ++j) {
                    
                    f2 = peakfreqs[j];
                    v2 = peakamps[j];
                    
                    if(f2>octave) break; //shortcut escape if separated by more than an octave
                    
                    diff = f2-f1; //no need for fabs, f2>f1
                    //minf =  //always f1 lower
                    
                    d = v1*v2*(Math.exp(a*diff) - Math.exp(b*diff));
                    
                    dissonancesum += d;
                }
                
            }
            
            dissonancesum *= self.norm_;
            
            if(dissonancesum>self.clamp_) dissonancesum = self.clamp_;
            
            self.dissonance_ = dissonancesum;
            //self.dissonance_ = sc_min(self.clamp_,dissonancesum*self.norm_); //numpeaks; //dissonancesum;  //divide by fftsize as compensation for amplitudes via FFT
            
        }
        
        
        //ZOUT0(i) = self.dissonance_;
        return self.dissonance_;
        
        //return ready;
        
    }
    
    
}



//sampleRate
function MMLLSpectralCentroid(sampleRate, fftsize=2048,hopsize=1024) {
    
    var self = this; 
    
    //sampleRate
    self.setup = function(sampleRate, fftsize=2048,hopsize=1024) {
        var i;
        
        //self.m_srate = sampleRate;
        self.fftsize_ = fftsize;
        
        self.nyquistbin_ = fftsize/2;
        
        self.stft = new MMLLSTFT(self.fftsize_,hopsize,2);

        //self.frequencyperbin_ = self.m_srate / self.fftsize_;
        
        self.spectralcentroid_ = 0.1;
        
    }
    
    self.setup(sampleRate, fftsize,hopsize);
    
    //must pass in fft data (power spectrum)
    self.next = function(input) {
        
        var i,j;
        
        var ready = self.stft.next(input);
        
        if(ready) {

            var fftbuf = self.stft.powers;
            
            var frequencyperbin = self.frequencyperbin_;
            
            var sumpower = 1.0; //start at 1 to avoid divide by zero
            var sum = 0.0;
            
            //float totalpeakpower = 0.0f;
            var intensity;
            
            for (j=1; j<self.nyquistbin_; ++j) {

                intensity = fftbuf[j];

                sumpower += intensity;

                sum += j*intensity;

            }
    
            self.spectralcentroid_ = (sum/sumpower)/self.fftsize_;
            
        }
            
            
        return self.spectralcentroid_;
   
    }
    
    
}



function MMLLSpectralPercentile(sampleRate, percentile=0.8,fftsize=2048,hopsize=1024) {
    
    var self = this; 
    
    self.percentile = percentile;
    
    self.setup = function(sampleRate, fftsize=2048,hopsize=1024) {
        var i;
        
        //self.m_srate = sampleRate;
        self.fftsize_ = fftsize;
        
        self.nyquistbin_ = fftsize/2;

        self.stft = new MMLLSTFT(self.fftsize_,hopsize,2);
        
        self.spectralpercentile_ = 0.1;
        
    }
    
    self.setup(sampleRate, fftsize,hopsize);
    
    //must pass in fft data (power spectrum)
    self.next = function(input) {
        
        var i,j;
        
        var ready = self.stft.next(input);
        
        if(ready) {

            var fftbuf = self.stft.powers;
            
            var frequencyperbin = self.frequencyperbin_;
            
            var sumpower = 0.0; //start at 1 to avoid divide by zero
            var targetpower;
            
            //float totalpeakpower = 0.0f;
            var intensity;
            
            for (j=0; j<self.nyquistbin_; ++j) {
                
                intensity = fftbuf[j];
                
                sumpower += intensity;
            }
    
            targetpower = self.percentile * sumpower;
            
            var whichbin = 0;
            
            sumpower = 0.0;
            
            for (j=0; j<self.nyquistbin_; ++j) {
                
                intensity = fftbuf[j];
                
                sumpower += intensity;
                
                if(sumpower>=targetpower) {
                    
                    whichbin = j;
                    
                    break;
                }
            }

            self.spectralpercentile_ =  whichbin/self.nyquistbin_;
            
        }
        
        return self.spectralpercentile_;
   
    }
    
    
}



function MMLLRMS(sampleRate, windowsize=2048,hopsize=1024) {
    
    var self = this; 
   
    self.setup = function(sampleRate, windowsize=2048,hopsize=1024) {
   
        //self.m_srate = sampleRate;
        self.windowsize_ = windowsize;
    
        self.windowing_ = new MMLLwindowing(windowsize,hopsize);
        
        self.rms_ = 0.0;
        
    }
    
    self.setup(sampleRate,windowsize,hopsize);
    
    self.next = function(input) {
        
        var i,j;
        
        var ready = self.windowing_.next(input);
        
        if(ready) {

            var store = self.windowing_.store;
            
            var temp;
            
            var sum = 0;
            
            for (j=0; j<self.windowsize_; ++j) {
                
                temp = store[j];
                
                sum += temp*temp;
            }
  
            self.rms_ =  Math.sqrt(sum/self.windowsize_);
            
        }
        
        return self.rms_;
   
    }
    
    
}


//Based on an informal juxtaposition of perceptual coding, and a Zwicker and Glasberg/Moore/Stone loudness model.
//ported from SC UGen Loudness created 8 Nov 2007
//requires sine windowing for correct calibration

function MMLLLoudness(sampleRate,fftsize=1024,hopsize=512,smask=0.25,tmask=1) {
    
    var self = this;

    //[43]
    self.eqlbandbins = [1,2,3,4,5,6,7,8,9,11,13,15,17,19,22,25,28,32,36,41,46,52,58,65,73,82,92,103,116,129,144,161,180,201,225,251,280,312,348,388,433,483,513];
    //[42]
    //last entry was 30, corrected to 29 to avoid grabbing nyquist value, only half fftsize bins actually calculated for power
    //safe anyway since only 40 ERB bands used
    self.eqlbandsizes = [1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,4,4,5,5,6,6,7,8,9,10,11,13,13,15,17,19,21,24,26,29,32,36,40,45,50,29];
    
    //[42][11]
    self.contours = [[ 47.88, 59.68, 68.55, 75.48, 81.71, 87.54, 93.24, 98.84,104.44,109.94,115.31],[ 29.04, 41.78, 51.98, 60.18, 67.51, 74.54, 81.34, 87.97, 94.61,101.21,107.74],[ 20.72, 32.83, 43.44, 52.18, 60.24, 67.89, 75.34, 82.70, 89.97, 97.23,104.49],[ 15.87, 27.14, 37.84, 46.94, 55.44, 63.57, 71.51, 79.34, 87.14, 94.97,102.37],[ 12.64, 23.24, 33.91, 43.27, 52.07, 60.57, 68.87, 77.10, 85.24, 93.44,100.90],[ 10.31, 20.43, 31.03, 40.54, 49.59, 58.33, 66.89, 75.43, 83.89, 92.34,100.80],[  8.51, 18.23, 28.83, 38.41, 47.65, 56.59, 65.42, 74.16, 82.89, 91.61,100.33],[  7.14, 16.55, 27.11, 36.79, 46.16, 55.27, 64.29, 73.24, 82.15, 91.06, 99.97],[  5.52, 14.58, 25.07, 34.88, 44.40, 53.73, 62.95, 72.18, 81.31, 90.44, 99.57],[  3.98, 12.69, 23.10, 32.99, 42.69, 52.27, 61.66, 71.15, 80.54, 89.93, 99.31],[  2.99, 11.43, 21.76, 31.73, 41.49, 51.22, 60.88, 70.51, 80.11, 89.70, 99.30],[  2.35, 10.58, 20.83, 30.86, 40.68, 50.51, 60.33, 70.08, 79.83, 89.58, 99.32],[  2.05, 10.12, 20.27, 30.35, 40.22, 50.10, 59.97, 69.82, 79.67, 89.52, 99.38],[  2.00,  9.93, 20.00, 30.07, 40.00, 49.93, 59.87, 69.80, 79.73, 89.67, 99.60],[  2.19, 10.00, 20.00, 30.00, 40.00, 50.00, 59.99, 69.99, 79.98, 89.98, 99.97],[  2.71, 10.56, 20.61, 30.71, 40.76, 50.81, 60.86, 70.96, 81.01, 91.06,101.17],[  3.11, 11.05, 21.19, 31.41, 41.53, 51.64, 61.75, 71.95, 82.05, 92.15,102.33],[  2.39, 10.69, 21.14, 31.52, 41.73, 51.95, 62.11, 72.31, 82.46, 92.56,102.59],[  1.50, 10.11, 20.82, 31.32, 41.62, 51.92, 62.12, 72.32, 82.52, 92.63,102.56],[ -0.17,  8.50, 19.27, 29.77, 40.07, 50.37, 60.57, 70.77, 80.97, 91.13,101.23],[ -1.80,  6.96, 17.77, 28.29, 38.61, 48.91, 59.13, 69.33, 79.53, 89.71, 99.86],[ -3.42,  5.49, 16.36, 26.94, 37.31, 47.61, 57.88, 68.08, 78.28, 88.41, 98.39],[ -4.73,  4.38, 15.34, 25.99, 36.39, 46.71, 57.01, 67.21, 77.41, 87.51, 97.41],[ -5.73,  3.63, 14.74, 25.48, 35.88, 46.26, 56.56, 66.76, 76.96, 87.06, 96.96],[ -6.24,  3.33, 14.59, 25.39, 35.84, 46.22, 56.52, 66.72, 76.92, 87.04, 97.00],[ -6.09,  3.62, 15.03, 25.83, 36.37, 46.70, 57.00, 67.20, 77.40, 87.57, 97.68],[ -5.32,  4.44, 15.90, 26.70, 37.28, 47.60, 57.90, 68.10, 78.30, 88.52, 98.78],[ -3.49,  6.17, 17.52, 28.32, 38.85, 49.22, 59.52, 69.72, 79.92, 90.20,100.61],[ -0.81,  8.58, 19.73, 30.44, 40.90, 51.24, 61.52, 71.69, 81.87, 92.15,102.63],[  2.91, 11.82, 22.64, 33.17, 43.53, 53.73, 63.96, 74.09, 84.22, 94.45,104.89],[  6.68, 15.19, 25.71, 36.03, 46.25, 56.31, 66.45, 76.49, 86.54, 96.72,107.15],[ 10.43, 18.65, 28.94, 39.02, 49.01, 58.98, 68.93, 78.78, 88.69, 98.83,109.36],[ 13.56, 21.65, 31.78, 41.68, 51.45, 61.31, 71.07, 80.73, 90.48,100.51,111.01],[ 14.36, 22.91, 33.19, 43.09, 52.71, 62.37, 71.92, 81.38, 90.88,100.56,110.56],[ 15.06, 23.90, 34.23, 44.05, 53.48, 62.90, 72.21, 81.43, 90.65, 99.93,109.34],[ 15.36, 23.90, 33.89, 43.31, 52.40, 61.42, 70.29, 79.18, 88.00, 96.69,105.17],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70],[ 15.60, 23.90, 33.60, 42.70, 51.50, 60.20, 68.70, 77.30, 85.80, 94.00,101.70]];
    //[11]
    self.phons = [2,10,20,30,40,50,60,70,80,90,100];
    
    //fftsize=1024,hopsize=512,
    self.setup = function(sampleRate,smask=0.25,tmask=1) {
        var i;
        
        self.m_srate = sampleRate;
        
        if(sampleRate < (44100*2)) {
            
            self.stft = new MMLLSTFT(1024,512,2); // 2 = sine window
            
        } else {
            
            self.stft = new MMLLSTFT(2048,1024,2);
        }
        
        
        self.m_numbands= 42;
        
        self.m_ERBbands = new Array(self.m_numbands);
        
        for (var k=0; k<self.m_numbands; ++k)
            self.m_ERBbands[k] = 0; 
            
        
        //self.fftsize_ = fftsize;
        //self.hopsize_ = hopsize;
        //self.stft = new MMLLSTFT(self.fftsize_,self.hopsize_,2); //sine windowing
        self.smask = smask;
        self.tmask = tmask;
       
       
        self.loudness_ = 0;
        
    }
    
    //fftsize,hopsize,
    self.setup(sampleRate,smask,tmask);
    
    //must pass in fft data (power spectrum)
    self.next = function(input) {
        
        //var i,j;
        var h,j,k;
        
        var ready = self.stft.next(input);
        
        if(ready) {
            
            var bandstart, bandsize, bandend, bsum;
            
            var db, prop;
            
            var power, lastpower, temp;
            
            var fftbuf = self.stft.powers;
            
            var loudsum = 0;
            
            for (k=0; k<self.m_numbands; ++k){
                
                bandstart = self.eqlbandbins[k];
                //int bandend=eqlbandbins[k+1];
                bandsize = self.eqlbandsizes[k];
                bandend = bandstart+bandsize;
                
                bsum = 0;
                
                lastpower = 0;
                
                for (h=bandstart; h<bandend;++h) {
           
                    power = fftbuf[h];
                    
                    //would involve spectral masking here
                    temp = lastpower*smask;
                    //sideways spectral masking with leaky integration
                    if(temp>power) power = temp;
                    
                    lastpower = power;
                    
                    //psychophysical sensation; within critical band, sum using a p metric, (sum m^p)^(1/p)
                    //compresses the gain
                    
                    //power of three combination
                    //bsum= bsum+(power*power*power);
                    
                    //won't sum up power very well
                    //if(power>bsum) bsum=power;
                    
                    bsum = bsum+power;
                    
                }
                
                //store recips of bandsizes?
                //why average? surely just take max or sum is better!
                //bsum= bsum/bandsize;
                
                //into dB, avoid log of 0
                //float db= 10*log10((bsum*10000000)+0.001);
                //float db= 10*log10((bsum*32382)+0.001);
                //empricially derived 32382*2.348
                
                db = 10*Math.log10((bsum*76032.936)+0.001); //correct multipler until you get loudness output of 1!
                
                //correcting for power of three combination
                //bsum=bsum+0.001;
                //4.8810017610244 = log10(76032.936)
                //float db= 10*((0.33334*log10(bsum)) + 4.8810017610244); //correct multipler until you get loudness output of 1!
                
                
                //printf("bsum %f db %f \n",bsum,db);
                
                //convert via contour
                if(db<self.contours[k][0]) db=0;
                else if (db>self.contours[k][10]) db=self.phons[10];
                else {
                    
                    prop=0.0;
                    
                    for (j=1; j<11; ++j) {
                        if(db<self.contours[k][j]) {
                            prop= (db-self.contours[k][j-1])/(self.contours[k][j]-self.contours[k][j-1]);
                            break;
                        }
                        
                        if ( j == 10 ) {
                            prop = 1.0;
                            break; // avoid j becoming 11 to avoid out-of-bounds access in db calculation
                        }
                    }
                    
                    
                    db = ((1-prop)*self.phons[j-1])+ (prop*self.phons[j]);
                    //printf("prop %f db %f j %d\n",prop,db,j);
                }
                
                //spectralmasking, 6dB drop per frame?
                //try also with just take db
                
                temp = (self.m_ERBbands[k]) - tmask;
                
                if(db>temp) temp = db;
                
                self.m_ERBbands[k] = temp;
                
                //printf("db %f erbband %f \n",db, unit->m_ERBbands[k]);
                
                //must sum as intensities, not dbs once corrected, pow used to be other way around
                //loudsum+= ((pow(10, 0.1*unit->m_ERBbands[k])-0.001)*0.0000308813538386); //
                
                loudsum += Math.pow(10, 0.1*self.m_ERBbands[k])-0.001; //multiplier not needed since invert below; can trust no overflow?
            }
            
            
            
            //total excitation, correct back to dB scale in phons
            //float phontotal= 10*log10((loudsum*32382)+0.001);
            var phontotal= 10*Math.log10((loudsum)+0.001); //didn't use divisor above, so no need to restore here
            
            //unit->m_phontotal= phontotal;
            //now to sones:
            /* from Praat: Excitation.c  Sones = 2 ** ((Phones - 40) / 10)  */
            self.loudness_ = Math.pow(2, (phontotal - 40) / 10);

          
        }
        
        
        //ZOUT0(i) = self.dissonance_;
        return self.loudness_;
        
        //return ready;
        
    }
    
    
}


//adapted from my SuperCollider UGen TPV
//itself based on
//Tracking Phase Vocoder following McAulay and Quatieri model from IEEE Trans acoustics, speech and signal processing vol assp-34(4) aug 1986

//ASSUMES BLOCKSIZE <= HOPSIZE can't calculate two FFTs per block


function PartialTrack() {
//	var theta1, omega1, theta2, omega2, alpha, beta; //cubic interpolation of phase
//	var amp1, amp2; //linear interpolation of amplitude
//    
    this.theta1 = 0;
    this.omega1 = 0;
    this.theta2 = 0;
    this.omega2 = 0;
    this.alpha = 0;
    this.beta = 0;
    this.amp1 = 0;
    this.amp2 = 0;
    
};


//freq in self case is omega, angular frequency in radians per sample = 2*PI*f/SR
function TPVPeak() {
	//var mag, freq, phase;  //improve frequency estimate by interpolation over amplitude of nearby points, or by time-frequency reassignment
    
    this.mag = 0;
    this.freq = 0;
    this.phase = 0;
    
};

//peak must satisfy amp(freq at index i-1)<amp(freq at index i)>amp(freq at index i+1), then cubic interpolation over local points (see wavetable interpolation code for processing)


//final list of peaks is size at most numpeaks(n) + numpeaks(n+1). reasonably around max of the two.
//as long as have birth and death resolved for each peak in the two lists, can synthesise up to curent frame. So output latency is one FFT frame


function MMLLTrackingPhaseVocoder(sampleRate,windowsize=1024, hopsize=512, maxpeaks=80, currentpeaks=40, freqmult=1.0, tolerance=4, noisefloor= 0.04) {
    
    var self = this;
    
    var i, j, temp;
    
    self.g_costableTPVsize = 1024;
    self.g_costableTPV = new Array(self.g_costableTPVsize+1); //extra value for wraparound linear interpolation calculations
    
    var g_costableTPVsizereciprocal = 1.0/ self.g_costableTPVsize;
    
    for (i=0; i<=self.g_costableTPVsize; ++i) {
        
        //2pi * (i/tablesize)
		temp = 6.2831853071796*(i * g_costableTPVsizereciprocal);
		
        self.g_costableTPV[i] = Math.cos(temp); //or sin
        
		//printf("cos check %d %f",i,g_costableTPV[i]);
        
	}

    
    //    self.previousfftdata = new Array(1024*self.numpreviousframes);
    // for(i=0; i<(1024*self.numpreviousframes); ++i)
  
   
self.setup = function(sampleRate) {
	var i;
    
    self.m_windowsize = windowsize; //defaults for now, may have to set as options later
	self.m_hopsize = hopsize;
    self.currentpeaks = currentpeaks;
    self.freqmult = freqmult;
    self.tolerance = tolerance;
    self.noisefloor = noisefloor;
    
    self.m_maxpeaks = maxpeaks;
    
    
    self.stft = new MMLLSTFT(self.m_windowsize,self.m_hopsize,1); //Hann window better for peak detection rather than rectangular
    
    
	//self.tcache=  (float*)RTAlloc(self.mWorld, self.m_hopsize * sizeof(float));
	self.t2cache =  new Float32Array(self.m_hopsize );
	self.t3cache = new Float32Array(self.m_hopsize );
	self.tpropcache =  new Float32Array(self.m_hopsize );
    
	var rhop= 1.0/self.m_hopsize;
    
	for (i=0; i<self.m_hopsize; ++i) {
		self.t2cache[i] = i*i;
		self.t3cache[i] = self.t2cache[i] * i;
		self.tpropcache[i] = i*rhop;
	}

	self.m_nover2 = self.m_windowsize/2;

	
    self.maxnumtracks = 2*self.m_maxpeaks;
    
	self.m_tracks= new Array(self.maxnumtracks);
    
	for (i=0; i<self.maxnumtracks; ++i) {
        
        self.m_tracks[i] = new PartialTrack();
        
//        self.m_tracks[i].theta1 = 0.0;
//        self.m_tracks[i].theta2 = 0.0;
//        self.m_tracks[i].omega1 = 0.0;
//        self.m_tracks[i].omega2 = 0.0;
//        self.m_tracks[i].alpha = 0.0;
//        self.m_tracks[i].beta = 0.0;
//        self.m_tracks[i].amp1 = 0.0;
//        self.m_tracks[i].amp2 = 0.0;
        
        
        
    }
  
    self.m_prevpeaks = new Array(self.m_maxpeaks);
    
    self.m_newpeaks = new Array(self.m_maxpeaks);
    
    for (i=0; i<self.m_maxpeaks; ++i) {
        
        self.m_prevpeaks[i] = new TPVPeak();
        self.m_newpeaks[i] = new TPVPeak();
        
        //mag, freq, phase;
//        self.m_prevpeaks[i].mag = 0.0;
//        self.m_prevpeaks[i].freq = 0.0;
//        self.m_prevpeaks[i].phase = 0.0;
//        self.m_newpeaks[i].mag = 0.0;
//        self.m_newpeaks[i].freq = 0.0;
//        self.m_newpeaks[i].phase = 0.0;
        
    }
  
	self.m_numprevpeaks = 0;
	self.m_numnewpeaks = 0;
	self.m_numtracks= 0;
	self.m_resynthesisposition = 0;

}

    self.setup(sampleRate);

    
    
    
    
    
    
    
    
self.newframe = function(complex,powers) {

        //only calculate phases for peaks, use power spectrum for peak detection rather than magnitude spectrum, then only take sqrt as needed
    
        //assumed in self representation
        //dc, nyquist then complex pairs
    
        //swap new peaks to old; current now safe to overwrite;
    
        //just copy data over
    
    
    for (i=0; i<self.m_maxpeaks; ++i) {

        self.m_prevpeaks[i].mag = self.m_newpeaks[i].mag;
        self.m_prevpeaks[i].freq = self.m_newpeaks[i].freq;
        self.m_prevpeaks[i].phase = self.m_newpeaks[i].phase;
    
    }
    
        //ditch old
        self.m_numprevpeaks = self.m_numnewpeaks;
        self.m_numnewpeaks = 0;
    
        
        var phase, prevmag, mag, nextmag;
        
        //bin 1 can't be pick since no interpolation possible! dc should be ignored
        //test each if peak candidate; if so, add to list and add to peaks total
        
        //prevmag = p->bin[0].mag; //self is at analysis frequency, not dc
        //mag = p->bin[1].mag;
    
        prevmag = powers[1];
        mag = powers[2];
    
    
        var numpeaksrequested = self.currentpeaks; //(int)ZIN0(4); //(int)(ZIN0(4)+0.0001);
        var maxpeaks = self.m_maxpeaks;
    
        if(maxpeaks>numpeaksrequested) maxpeaks = numpeaksrequested
    
        //maxpeaks = sc_min(maxpeaks,numpeaksrequested);
    
    
    
        //angular frequency is pi*(i/nover2)
        
        var angmult= 3.1415926535898/self.m_nover2;
        var ampmult= (1.0/self.m_windowsize); //*(1.0/self.m_maxpeaks);
        
		//defined here since needed in backdating phase for track births (and potentially for track deaths too)
        //T = number of samples per interpolaion frame, so equals hopsize
        var T = self.m_hopsize;
        
        //float invT= 1.0/T;
        
        //should also adjust tolerance? (ie change angmult itself)
        //float freqmult= ZIN0(5); //(int)(ZIN0(4)+0.0001);
    
    //really powercheck
    var ampcheck = self.noisefloor; // * noisefloor; // power check ZIN0(7); //0.001
    
    var real,imag;
    
        //could restrict not to go above nover4!
        for (i=3; i<(self.m_nover2-1); ++i) {
            
            //phase= p->bin[i].phase;
            nextmag = powers[i]; //p->bin[i].mag;
            
            if ((prevmag<mag) && (nextmag<mag) && (mag>ampcheck) && (self.m_numnewpeaks<maxpeaks)) {
                //found a peak
                
                //could use cubic interpolation// successive parabolic interpolation to refine peak location; or should have zero padded
                self.m_newpeaks[self.m_numnewpeaks].mag = Math.sqrt(mag) * ampmult; //must divide by fftsize before resynthesis!
                self.m_newpeaks[self.m_numnewpeaks].freq =(i-1)*angmult*self.freqmult; //if should be angular frequency per sample, divide by T
                
                real = complex[2*i-2];
                imag = complex[2*i-1];
                
                self.m_newpeaks[self.m_numnewpeaks].phase = Math.atan(imag, real); //p->bin[i-1].phase;	//is self in range -pi to pi? more like -1 to 5 or so, but hey, is in radians
                
                //printf("newpeak %d amp %f freq %f phase %f \n",numnewpeaks, mag * ampmult,(i-1)*angmult, p->bin[i-1].phase);
                
                ++self.m_numnewpeaks;
                
            }
            
            prevmag=mag;
            mag=nextmag;
            
        }

        
        //now peak matching algorithm
        var rightsort = 0;
        var flag = true;
    
        var tracks = self.m_tracks;
        var numtracks = 0; //self.m_numtracks;
        
        //increase tolerance
        var tolerance = self.tolerance; //ZIN0(6)*angmult;
    
        var testfreq;
    
        //ASSUMES BOTH PEAKS LISTS ARE IN ORDER OF INCREASING FREQUENCY
        
        //while right less than left-tolerance then birth on right
        
        //if right within tolerance, find closest; if less than, match, else must check next on left whether better match. If not, match, else, check previous on right. If within tolerance, match, else death on right.
        
        //step through prevpeaks
        for (i=0; i<self.m_numprevpeaks; ++i) {
            
            var freqnow = self.m_prevpeaks[i].freq;
            
            flag = true;
            
            while(flag) {
                
                if(rightsort>=self.m_numnewpeaks) {flag=false;} else {
                    testfreq= self.m_newpeaks[rightsort].freq;
                    
                    if((testfreq+tolerance)<freqnow) {
                        //birth on right
                        tracks[numtracks].omega1 = self.m_newpeaks[rightsort].freq;
                        tracks[numtracks].theta2 = self.m_newpeaks[rightsort].phase;
                        tracks[numtracks].omega2 = self.m_newpeaks[rightsort].freq; //match to itself
                        tracks[numtracks].theta1 = self.m_newpeaks[rightsort].phase - (T*(self.m_newpeaks[rightsort].freq)); //should really be current phase + freq*hopsize
                        tracks[numtracks].amp1 = 0.0;
                        tracks[numtracks].amp2 = self.m_newpeaks[rightsort].mag;
                        ++numtracks;
                        ++rightsort;
                        
                    } else {
                        
                        flag=false;
                        
                    }
                    
                }
                
            }
            
            flag=false; //whether match process fails
            if(rightsort>=self.m_numnewpeaks) {flag=true;} else {
				//printf("testfreq %f freqnow %f tolerance %f \n ", testfreq, freqnow, tolerance);
                
                //assumption that testfreq already valid;
                if (testfreq>(freqnow+tolerance)) {flag=true;} else {
                    
                    //now have a candidate. search for closest amongst remaining; as soon as no closer, break
                    //printf("candidate! \n ");
                    
                    var bestsofar = Math.abs(freqnow - testfreq);
                    var bestindex = rightsort;
                    
                    for (j=(rightsort+1); j<self.m_numnewpeaks; ++j) {
                        var newcandidate = self.m_newpeaks[j].freq;
                        var newproximity = Math.abs(newcandidate-freqnow);
                        
                        //must keep getting closer, else no use
                        if(newproximity<bestsofar) {bestindex = j; bestsofar = newproximity;}
                        else break; //nothing better
                    }
                    
                    //now have closest estimate. If less than freqnow have match
                    var closest = self.m_newpeaks[bestindex].freq;
                    var havematch = false;
                    
                    //printf("closest! %f bestindex %d rightsort %d \n ", closest, bestindex, rightsort);
                    
                    if(closest<freqnow || (i==(self.m_numprevpeaks-1))) havematch=true;
                    else { //test next i as available in self case
                        
                        var competitor = self.m_prevpeaks[i+1].freq;
                        
                        if (Math.abs(competitor-closest)<bestsofar) {
                            
                            //if no alternative
                            if (bestindex == rightsort) flag= true; //failure to match anything
                            else {bestindex = rightsort-1;
                                havematch = true;
                            }
                            
                        } else
                            havematch=true;
                        
                    }
                    
                    if(havematch) {
                        
                        //int newrightsort= bestindex;
                        //if() newrightsort=
                        
                        //TIDY UP ANY CANIDATES MISSED OUT BY THIS PROCESS
                        
                        for (j=rightsort; j<=(bestindex-1);++j) {
                            //BIRTHS ON RIGHT
                            
                            tracks[numtracks].omega1=self.m_newpeaks[j].freq;
                            tracks[numtracks].theta2=self.m_newpeaks[j].phase;
                            tracks[numtracks].omega2=self.m_newpeaks[j].freq; //match to itself
                            
                            temp = self.m_newpeaks[j].phase - (T*(self.m_newpeaks[j].freq));
                                    
                            temp = (temp % 6.2831853071796 + 6.2831853071796)%6.2831853071796;
                            
                            tracks[numtracks].theta1 = temp; //sc_wrap(newpeaks[j].phase - (T*(self.newpeaks[j].freq)),0.0f,(float)twopi); //backcalculate starting phase
                            tracks[numtracks].amp1 = 0.0;
                            tracks[numtracks].amp2 = self.m_newpeaks[j].mag;
                            ++numtracks;
                            ++rightsort;
                        }
                        
                        //printf("match! \n ");
                        
                        //MATCH!
                        tracks[numtracks].theta1 = self.m_prevpeaks[i].phase;
                        tracks[numtracks].omega1 = self.m_prevpeaks[i].freq;
                        tracks[numtracks].theta2 = self.m_newpeaks[rightsort].phase; //match to itself; should really be current phase + freq*hopsize
                        tracks[numtracks].omega2 = self.m_newpeaks[rightsort].freq; //match to itself
                        tracks[numtracks].amp1 = self.m_prevpeaks[i].mag;
                        tracks[numtracks].amp2 = self.m_newpeaks[rightsort].mag;
                        
                        //yes, OK
                        //printf("amp check i %d amp1 %f amp2 %f source1 %f source2 %f\n",i,tracks[numtracks].amp1, tracks[numtracks].amp2, prevpeaks[i].mag, newpeaks[rightsort].mag);
                        ++numtracks;
                        ++rightsort;
                        
                        //rightsort=bestindex+1;
                        
                    }
                    
                    //if was flag==true, then none missed out, still on rightsort
                    
                }
                
            }
            
            
            //match failed, death on left
            if (flag==true) {
                
                //DEATH ON LEFT
                
                //death on left
                tracks[numtracks].theta1 = self.m_prevpeaks[i].phase;
                tracks[numtracks].omega1 = self.m_prevpeaks[i].freq;
                
                temp = self.m_prevpeaks[i].phase + (T*self.m_prevpeaks[i].freq)
                        
                temp = (temp % 6.2831853071796 + 6.2831853071796)%6.2831853071796;
                        
                tracks[numtracks].theta2 = temp; //sc_wrap(prevpeaks[i].phase + (T*prevpeaks[i].freq),0.0f,(float)twopi); //match to itself; should really be current phase + freq*hopsize
                tracks[numtracks].omega2 = self.m_prevpeaks[i].freq; //match to itself
                tracks[numtracks].amp1 = self.m_prevpeaks[i].mag;
                tracks[numtracks].amp2 = 0.0;
                ++numtracks;
                
                //ADDCODE
                //++leftsort;
            }
            
        }
        
        //rightsort should equal numnewpeaks!
        
        //now iterate through PartialTracks, preparing them for synthesis
        self.m_numtracks = numtracks;
        
        var theta1, omega1, theta2, omega2; //, amp1, amp2;  //, alpha, beta
        
        var M;
        var Tover2= T/2.0;
        //float oneovertwopi = 1.0/(2*PI);
        var temp1, temp2;
        
        //matrix elements common to all track calculations: eqn (34)
        //for hyperefficiency could precalculate some of self material in constructor of course...
        var r1c1=3.0/(T*T);
        var r1c2= (-1.0)/T;
        var r2c1= (-2.0)/(T*T*T);
        var r2c2= 1.0/(T*T);
        
        //printf("matrix checks %f %f %f %f \n",r1c1,r1c2,r2c1,r2c2);
        
        var rtwopi = 0.1591549430919;
        
        //precalculate cubic interpolation parameters alpha and beta as per eqn (37) in McAulay and Quatieri
        //must go via M, the integer of extra phase for theta2
        for (i=0; i<numtracks; ++i) {
            
			theta1 = tracks[i].theta1;
			theta2 = tracks[i].theta2;
			omega1 = tracks[i].omega1;
			omega2 = tracks[i].omega2;
            
			//rpitwo= 1/2pi see SC_constants
			//round off as (int)(0.5+val)
			var mtemp = rtwopi*((theta1 + (omega1*T) - theta2) + ((omega2-omega1)*Tover2) );
            
			if(mtemp<0.0)
                M = Math.floor(mtemp-0.5);
			else
                M = Math.floor(mtemp+0.5);
            
			temp1 = theta2 - theta1 - (omega1*T) + (6.2831853071796*M);
			temp2 = omega2-omega1;
            
			//matrix solution
			tracks[i].alpha = r1c1*temp1 + r1c2*temp2;
			tracks[i].beta = r2c1*temp1 + r2c2*temp2;
            
			//if(i==20) {
			//printf("track check %d theta1 %f theta2 %f omega1 %f omega2 %f amp1 %f amp2 %f M %d alpha %f beta %f \n",i,theta1,theta2,omega1,omega2,tracks[i].amp1, tracks[i].amp2,M,tracks[i].alpha, tracks[i].beta);
			//}
        }
        
        
        //struct PartialTrack {
        //float theta1, omega1, theta2, omega2, alpha, beta; //cubic interpolation of phase
        //float startamp, endamp; //linear interpolation of amplitude
        //};
        
        
        
    }
    
    
    
    
    
    
    
    
//can dynamically reduce or increase the number of peaks stored (trails will automatically birth and die)
    
//must pass in fft data (power spectrum)
self.next = function(input,out,numSamples) {

    var i,j;
 
    var ready = self.stft.next(input);
    
    if(ready) {
    
        var fftbuf = self.stft.complex; //powers;
        var powers = self.stft.powers;
        
        self.newframe(fftbuf,powers);
        
		self.m_resynthesisposition=0;
    
      
  }

	//implement here in code
	//oscillatorbankresynthesis
 
	//zero output first in case silent output
	for (j=0; j<numSamples; ++j) {
		out[j]=0.0;
	}
    
    var t,t2,t3;
	var tpos;
	var index;
    var amp,amp1,amp2,phase,phasetemp,wrapval,prev,prop,interp;
    var amp1, amp2, theta1, omega1, alpha, beta;
    
    var tracknow;
    
	//printf("numtracks %d \n", numtracks);
    
	for (i=0; i<self.m_numtracks; ++i) {
   
        tracknow = self.m_tracks[i];
        
		amp1 = tracknow.amp1;
		amp2 = tracknow.amp2;
		theta1 = tracknow.theta1;
		omega1 = tracknow.omega1;
		alpha = tracknow.alpha;
		beta = tracknow.beta;
        
		for (j=0; j<numSamples; ++j) {
            
			index = self.m_resynthesisposition+j;
            
			t = index; ///T;
			t2 = self.t2cache[index]; //t*t;
			t3 = self.t3cache[index]; //t*t2;
			tpos = self.tpropcache[index]; //((float)t/T);
            
			//linear interpolation of amplitude
            amp = amp1 + (tpos*(amp2- amp1));
			//printf("amp %f temp3 %f amp2 %f number %f \n",amp,temp3, tracks[i].amp2, ((float)t/T));
            
			//cubic interpolation of phase; probably self is the chief cause of inefficiency...
			phase = (theta1) + (t*omega1)+(t2*alpha) +(t3*beta);
            
            //0.1591549430919 = reciptwopi
			phasetemp = phase*0.1591549430919*self.g_costableTPVsize;
            
			//linear interpolation into costable
			//could use fmod if add very big multiple of pi so modulo works properly; ie, no negative phases allowed BUT fmod is really inefficient!
			//float wrapval= sc_wrap(phasetemp,0.0f,1024.0f); //modulo or fold won't work correctly- i.e., we need -1 = 1023
            
            //to cope with negatives
            //https://stackoverflow.com/questions/16964225/keep-an-index-within-bounds-and-wrap-around
            wrapval = (phasetemp%1024 + 1024)%1024; //(x%m + m)%m
            
			prev = Math.floor(wrapval);
			prop =  wrapval-prev; //linear interpolation parameter
			interp = ((1.0-prop)*(self.g_costableTPV[prev])) + (prop*(self.g_costableTPV[prev+1]));
       
			out[j] += amp*interp; //g_costableTPV[((int)(phasetemp))%g_costableTPVsize];
		}
        
	}
    
    
	self.m_resynthesisposition += numSamples;


}

    
}

//(c) Nick Collins 2019
//adapted from SC UGen Qitch, originally 8/1/05 by Nicholas M. Collins after Brown/Puckette


function MMLLQitch(sampleRate,windowsize=4096,minFreq=30,maxFreq=2000) {
    
    var self = this; 
    
    //11
    self.g_sieve = [0,24,38,48,56,62,67,72,76,80,83];
    self.g_amps = [1,0.96,0.92,0.88,0.84,0.8,0.76,0.72,0.68,0.64,0.6];
    
self.setup = function(sampleRate) {
	var i;
    
    self.m_srate = sampleRate;
    self.m_N = windowsize;
    
    if(self.m_srate==44100)
	{
        if(self.m_N ==2048)
		self.pdata = self.qdata2048sr44100;
        else
        self.pdata = self.qdata4096sr44100;
	}
	else  //else 48000; potentially dangerous if it isn't! Fortunately, shouldn't write any data to unknown memory
	{
        if(self.m_N ==2048)
		self.pdata = self.qdata2048sr48000;
        else
        self.pdata = self.qdata4096sr48000;
	}
    
//    int SR = (int)pdata[0];
//	int fftN = (int)pdata[1];
	
    
    self.stft = new MMLLSTFT(self.m_N,512,0); //Rectangular (NO) windowing 2048
    
	var numbands= self.pdata[2];
	
	self.m_qbands = numbands;
    
	self.m_SR = sr;
    
    var fftN = self.m_N; //2048;
    
	//self.m_N = fftN;
	self.m_fftscale = 1.0/(2.0*fftN); //altivec 1.0/(2.0*fftN);
	self.m_freqperbin = self.m_srate/fftN;
	
	//constants for efficiency
	self.m_twopioverN = 6.28318530717952646/fftN;
	self.realb = Math.cos(self.m_twopioverN);
	self.imagb = Math.sin(self.m_twopioverN);
	
    
    self.qfreqs = new Array(numbands);
    self.startindex = new Array(numbands);
    self.numindices = new Array(numbands);
    self.speckernelvals = new Array(numbands); //Array of arrays
    self.qmags = new Array(numbands);

	//load data
	var bufpos=3; //4;
	
	//printf("%d %p %d %p \n",i,&(pdata[bufpos]),bufpos,pdata);
	
	//can be made more efficient with pointers
	for (i=0;i<numbands; ++i) {
		
		//printf("%d %p %d %p \n",i,&(pdata[bufpos]),bufpos,pdata);
		
		//freq startind cumul numvals vals'
		self.qfreqs[i]= self.pdata[bufpos];
		self.startindex[i]= self.pdata[bufpos+1];
		self.numindices[i]= self.pdata[bufpos+2]; //+3
		
		//int specind= pdata[bufpos+2]; //cumulative position into this buffer
		//m_cumulindices[i]=specind;
		
		//printf("%d startind %d numind %d cumul %d \n",i, m_startindex[i], m_numindices[i], m_cumulindices[i]);
		bufpos+=3; //4;
		
        //copies subarray
		self.speckernelvals[i] = self.pdata.slice(bufpos,bufpos+self.numindices[i]); //pdata +bufpos;
		
		//printf("%d %p %d %p %p \n",i,&(pdata[bufpos]),bufpos,pdata+bufpos, speckernelvals[i]);
		
		/*
		 for (j=0;j<m_numindices[i]; ++j) {
         
         m_speckernelvals[specind+j]= pdata[bufpos+j];
         //if(pdata[bufpos+j]>1000) printf("%d big %f indtarget %d indsource %d",i,pdata[bufpos+j],specind+j,bufpos+j);
		 }*/
		
		bufpos+= self.numindices[i];
	}
//	
//	m_qfreqs=qfreqs;
//	m_startindex= startindex;
//	m_numindices= numindices;
//	m_speckernelvals= speckernelvals;
//	m_qmags= qmags;
	
	
	/////storing complex numbers from previous frames for instananeous frequency calculation
	self.m_topqcandidate = numbands-(self.g_sieve[10])-1; //85
    //var tempfreq= self.qfreqs[self.m_topqcandidate];
	//m_ifbins=((int)ceil((tempfreq/(m_freqperbin))+0.5))+1; //cover yourself for safety
	
	//printf("numbinsstored %d tempfreq %f topcand %d \n",m_ifbins,tempfreq, m_topqcandidate); //more info!
	
	//if input amp template can correct search comb
	
    self.m_amps = new Array(11);
    
	for (i=0;i<11;++i)
		self.m_amps[i]= self.g_amps[i];
	
    //	uint32 ampbufnum = (uint32)ZIN0(4);
    //	if (!((ampbufnum > world->mNumSndBufs) || ampbufnum<0)) {
    //		SndBuf *buf2 = world->mSndBufs + ampbufnum;
    //
    //		bufsize = buf2->samples;
    //
    //		pdata= buf2->data;
    //
    //		if(bufsize==11) {
    //			for (i=0;i<11;++i)
    //				m_amps[i]= pdata[i];
    //		}
    //	}
	
    //kr (in: 0, databufnum, ampThreshold: 0.01, algoflag: 1, ampbufnum, minfreq: 0, maxfreq: 2500)
    
	self.m_minfreq = minFreq; //30; //ZIN0(5);
	self.m_maxfreq = maxFreq; //2000; //ZIN0(6);
	
	//search qfreqs
	self.m_minqband = 0;
	self.m_maxqband = self.m_topqcandidate;
	
	for(i=0;i<numbands; ++i) {
		
		if(self.qfreqs[i]>=self.m_minfreq) {self.m_minqband=i; break;}
		
	}
	
	for(i=numbands-1;i>=0; --i) {
		
		if(self.qfreqs[i]<=self.m_maxfreq) {self.m_maxqband=i; break;}
		
	}
	
	//unecessary, already true m_maxqband= sc_min(m_topqcandidate, m_maxqband);
	//m_minqband= sc_min(m_minqband, m_maxqband); //necessary test if input stupid
	
    if(self.m_maxqband<self.m_minqband) self.m_minqband = self.m_maxqband;
    
	//printf("minfreq %f maxfreq %f minqband %d maxqband %d \n", m_minfreq, m_maxfreq, m_minqband,m_maxqband);
	
    self.m_midipitch = 69;
	self.m_currfreq=440;
	self.m_hasfreq=0;
    
  
    
}

   
//must pass in fft data (power spectrum)
self.next = function(input) {

    var i,j;
    
    var ready = self.stft.next(input);
    
    if(ready) {
    var fftN = self.m_N;
	       
    var fftbuf = self.stft.complex;
    var powers = self.stft.powers;
    
        
        //check threshold using powers
        var ampthresh = 1; //0.01; //ZIN0(2); //*2048?
        
        var ampok = false;
        
        for (j = 0; j < fftN; ++j) {
            if (powers[j] >= ampthresh) {
                ampok = true;
                break;
            }
        }
        
        if(ampok) {
            
            
            
            
            //will probably want to store phase first
            
            // Squared Absolute so get power
            //for (i=0; i<g_N; i+=2)
            //		//i>>1 is i/2
            //		fftbuf[i>>1] = (fftbuf[i] * fftbuf[i]) + (fftbuf[i+1] * fftbuf[i+1]);
            //
            
            //amortise state changes:
            
            ///////////////////////////////////////////////////////////////
            //constant Q conversion, only need magnitudes
            var qtodo = self.m_qbands;
            
            var magtotal=0.0;
            
            //printf("here 2 %p %p %p \n",speckernelvals, speckernelvals[0], speckernelvals[0]-6);
            
            var indexnow;
            
            for (i=0; i<qtodo; ++i) {
                
                var realsum=0.0;
                var imagsum=0.0;
                
                var start = self.startindex[i];
                var end = self.numindices[i];
                
                //float * readbase= speckernelvals[i]-start; //+(m_cumulindices[i])-start;
                
                //printf("%d %p %p %p \n",i, speckernelvals[i], speckernelvals[i]-start, readbase);
                
                for (j=0; j<end; ++j) {
                    
                    indexnow = (j+start);
                    
                    var mult = self.speckernelvals[i][j]; //readbase[j];
                    
                    //Altivec version
                    //realsum+= mult*fftbuf[2*j];
                    //imagsum+= mult*fftbuf[2*j+1];
                    
                    //fftw version
                    //realsum+= mult*fftbuf[j];
                    //imagsum+= mult*fftbuf[fftN-j];
                    
                    //sc fft version
                    realsum += mult*fftbuf[2*indexnow];
                    imagsum += mult*fftbuf[2*indexnow+1];
                }
                
                //scale here by 1/(2*g_N)
                
                //sclaing unecessary
                //realsum*=m_fftscale;
                //imagsum*=m_fftscale;
                
                self.qmags[i] = realsum*realsum+imagsum*imagsum;
                
                magtotal += self.qmags[i];
                //if(i>70) printf("%d %f   ",i,qmags[i]);
                
            }
            //printf("\n");
            
            /////////////////////////////////////////////////////////
            var max = 0.0;
            var maxindex = 0;
            
            //done as per Pitch UGen now
            //float intensitycheck = ZIN0(2); //intensity check
            
            //only bother to test if amplitude is sufficient
            //printf("intensity %f check %f \n",magtotal, intensitycheck);
            
            //if(magtotal<intensitycheck) {m_hasfreq=0;}
            //else {
            
            //float * pamps= m_amps;
            
            self.m_hasfreq=1; //could turn off if too close to call...won't bother for now
            
            //pitch detection by cross correlation, only check roots up to 2000 or so, also don't need guard element then!
            
            //can check even less if use minqband, qmaxband
            
            //int minqband= ZIN0(5);
            //int maxqband= sc_min(m_topqcandidate, ZIN0(6));
            
            //for (i=0; i<m_topqcandidate; ++i) {
            
            for (i=self.m_minqband; i<self.m_maxqband; ++i) {
                
                var sum=0.0;
                
                for (j=0; j<11; ++j) {
                    sum += self.m_amps[j]*self.qmags[i+self.g_sieve[j]];
                }
                
                if(sum>max) {max=sum; maxindex=i;
                    //printf("maxsum %f maxind %d \n",max, maxindex);
                }
                
            }
            
            //printf("pitch %f \n",qfreqs[maxindex]);
            
            var pitchcheck = 1; //ZIN0(3);
            
            if(pitchcheck<0.5) { self.m_currfreq = self.qfreqs[maxindex];}
            else {
                
                //////////////////////////////////////////////////////////INSTANTANEOUS FREQUENCY TRACK
                
                var k = Math.floor((self.qfreqs[maxindex]/self.m_freqperbin)+0.5);
                
                //printf("check k %f %f %f %d \n",qfreqs[maxindex],m_freqperbin,(qfreqs[maxindex]/m_freqperbin)+0.5,k);
                
                
                //k can't be zero else trouble
                
                //Xhk=0.5*(F.data(k,ii)-0.5*F.data(k+1,ii)-0.5*F.data(k-1,ii));
                //    Xhk2= 0.5*exp(j*2*pi*k/F.N)*(F.data(k,ii)- (0.5*exp(j*2*pi/F.N)*F.data(k+1,ii)) - (0.5*exp(-j*2*pi/F.N)*F.data(k-1,ii)));
                //
                //    theta2= angle(Xhk2); %atan(imag(Xhk2)/real(Xhk2));
                //    theta= angle(Xhk); %atan(imag(Xhk)/real(Xhk));
                //
                //    w(ii)= 44100*(abs(theta2-theta))/(2*pi);
                //
                //
                
                //instantaneous frequency correction
                var Xhkreal, Xhkimag, Xhk2real, Xhk2imag;
                
                //Altivec
                //Xhkreal=0.5*((fftbuf[2*k])-(0.5*fftbuf[2*(k+1)])-(0.5*fftbuf[2*(k-1)]));
                //Xhkimag=0.5*((fftbuf[2*k+1])-(0.5*fftbuf[2*(k+1)+1])-(0.5*fftbuf[2*(k-1)+1]));
                
                
                Xhkreal = 0.5*((fftbuf[k])-(0.5*fftbuf[k+1])-(0.5*fftbuf[k-1]));
                Xhkimag = 0.5*((fftbuf[fftN- k])-(0.5*fftbuf[fftN- (k+1)])-(0.5*fftbuf[fftN- (k-1)]));
                
                
                //complex exponentials to calculate a= exp(j*2*pi*k/F.N)   b= exp(j*2*pi/F.N)  c= exp(-j*2*pi/F.N)
                //float areal= cos(TWOPI*k/g_N);
                //float aimag= sin(TWOPI*k/g_N);
                
                //		float breal= cos(TWOPI/g_N);
                //			float bimag= sin(TWOPI/g_N);
                //
                //			float creal= breal;
                //			float cimag= -bimag;
                //
                //			float tmpreal= fftbuf[2*k] - (0.5*((breal*fftbuf[2*(k+1)]) - (bimag*fftbuf[2*(k+1)+1]))) - (0.5*((creal*fftbuf[2*(k-1)]) - (cimag*fftbuf[2*(k-1)+1])));
                //			float tmpimag= fftbuf[2*k+1] - (0.5*((breal*fftbuf[2*(k+1)+1]) + (bimag*fftbuf[2*(k+1)]))) - (0.5*((creal*fftbuf[2*(k-1)+1]) + (cimag*fftbuf[2*(k-1)])));
                //
                var calc = (self.m_twopioverN)*k;
                var areal = Math.cos(calc);
                var aimag = Math.sin(calc);
                
                var breal = self.realb;
                var bimag = self.imagb;
                
                
                //float tmpreal= fftbuf[2*k] - (0.5*((breal*fftbuf[2*(k+1)]) - (bimag*fftbuf[2*(k+1)+1]))) - (0.5*((breal*fftbuf[2*(k-1)]) + (bimag*fftbuf[2*(k-1)+1])));
                //float tmpimag= fftbuf[2*k+1] - (0.5*((breal*fftbuf[2*(k+1)+1]) + (bimag*fftbuf[2*(k+1)]))) - (0.5*((breal*fftbuf[2*(k-1)+1]) - (bimag*fftbuf[2*(k-1)])));
                
                
                var tmpreal = fftbuf[k] - (0.5*((breal*fftbuf[k+1]) - (bimag*fftbuf[fftN- (k+1)]))) - (0.5*((breal*fftbuf[k-1]) + (bimag*fftbuf[fftN- (k-1)])));
                var tmpimag = fftbuf[fftN-k] - (0.5*((breal*fftbuf[fftN- (k+1)]) + (bimag*fftbuf[k+1]))) - (0.5*((breal*fftbuf[fftN- (k-1)]) - (bimag*fftbuf[k-1])));
                
                
                Xhk2real= 0.5*(areal*tmpreal- aimag*tmpimag);
                Xhk2imag= 0.5*(areal*tmpimag+ aimag*tmpreal);
                
                //float Xhk2= 0.5*exp(j*2*pi*k/F.N)*(F.data(k,ii)- (0.5*exp(j*2*pi/F.N)*F.data(k+1,ii)) - (0.5*exp(-j*2*pi/F.N)*F.data(k-1,ii)));
                
                var theta2 = Math.atan(Xhk2imag/Xhk2real);
                var theta = Math.atan(Xhkimag/Xhkreal);
                
                var freq= (self.m_SR)*(Math.abs(theta2-theta))/6.28318530717952646;
                
                //printf("do you believe freq? %d max %f min %f result %f\n",k,m_maxfreq, m_minfreq, freq);
                
                //check no dodgy answers
                if((freq<self.m_minfreq) || (freq>self.m_maxfreq)) {self.m_hasfreq=0;}
                else
                    self.m_currfreq = freq;
                
            }
            
            
            //printf("testfreq %f\n",m_currfreq);
            
            self.m_midipitch = (Math.log2(self.m_currfreq/440) * 12) + 69; //(((log2(m_currfreq/440.0)) * 12) + 69); //as MIDI notes
            
        }	else {self.m_hasfreq=0;}
        
    
    }
    
    return self.m_currfreq; //m_midipitch;
    
  }


    //have both for window size 4096 too in original SC codebase
    
    
    //7720 entries
    self.qdata2048sr44100 = [ 44100.0, 2048.0, 168.0, 174.60000610352, 8.0, 1.0, 0.26945972442627, 179.71617126465, 8.0, 2.0, 0.2476606965065, -0.19492261111736, 184.98225402832, 8.0, 2.0, 0.20971313118935, -0.24143984913826, 190.40264892578, 8.0, 2.0, 0.16375735402107, -0.26797798275948, 195.98187255859, 9.0, 2.0, -0.27031907439232, 0.15830866992474, 201.72457885742, 9.0, 2.0, -0.25004988908768, 0.21308781206608, 207.63555908203, 9.0, 2.0, -0.21308307349682, 0.25340628623962, 213.71974182129, 9.0, 2.0, -0.16746048629284, 0.27160024642944, 219.98220825195, 10.0, 2.0, 0.26553645730019, -0.19768193364143, 226.42819213867, 10.0, 2.0, 0.23855504393578, -0.24337650835514, 233.06303405762, 10.0, 2.0, 0.19759693741798, -0.2687092423439, 239.8923034668, 10.0, 3.0, 0.15091289579868, -0.26979473233223, 0.19701531529427, 246.92169189453, 11.0, 2.0, -0.24848681688309, 0.2429059445858, 254.15704345703, 11.0, 3.0, -0.21090957522392, 0.26853573322296, -0.15345101058483, 261.60440063477, 11.0, 3.0, -0.16510571539402, 0.26992738246918, -0.2089216709137, 269.27001953125, 12.0, 2.0, 0.24888311326504, -0.25082126259804, 277.16021728516, 12.0, 3.0, 0.21141338348389, -0.27102422714233, 0.17838282883167, 285.28164672852, 12.0, 3.0, 0.16565284132957, -0.26694485545158, 0.22933179140091, 293.64102172852, 13.0, 3.0, -0.24150010943413, 0.26253780722618, -0.15607307851315, 302.24536132812, 13.0, 3.0, -0.20137518644333, 0.27219024300575, -0.21109859645367, 311.1018371582, 13.0, 3.0, -0.15486095845699, 0.25819554924965, -0.25222793221474, 320.21780395508, 14.0, 3.0, 0.22543431818485, -0.27135837078094, 0.19911578297615, 329.60092163086, 14.0, 3.0, 0.18158729374409, -0.26621177792549, 0.24438291788101, 339.25894165039, 15.0, 3.0, -0.23993863165379, 0.2690723836422, -0.19370979070663, 349.20001220703, 15.0, 3.0, -0.19944880902767, 0.26950567960739, -0.24071767926216, 359.4323425293, 15.0, 4.0, -0.15282486379147, 0.24769461154938, -0.26768782734871, 0.1949810385704, 369.96450805664, 16.0, 3.0, 0.20976543426514, -0.27054730057716, 0.24147912859917, 380.80529785156, 16.0, 4.0, 0.16373701393604, -0.25070372223854, 0.26800680160522, -0.20162552595139, 391.96374511719, 17.0, 4.0, -0.21400056779385, 0.27036383748055, -0.24612008035183, 0.1582655608654, 403.44915771484, 17.0, 4.0, -0.1684750020504, 0.25008651614189, -0.26968115568161, 0.21306592226028, 415.27111816406, 18.0, 4.0, 0.21309441328049, -0.26895394921303, 0.2534174323082, -0.17613212764263, 427.43948364258, 18.0, 4.0, 0.16754116117954, -0.24613605439663, 0.27162808179855, -0.22764606773853, 439.96441650391, 19.0, 4.0, -0.20763804018497, 0.26556798815727, -0.26168549060822, 0.1977521777153, 452.85638427734, 19.0, 5.0, -0.16151563823223, 0.2386035323143, -0.27228343486786, 0.24342167377472, -0.16768307983875, 466.12606811523, 20.0, 4.0, 0.19759714603424, -0.25917464494705, 0.26874575018883, -0.22076244652271, 479.78460693359, 20.0, 5.0, 0.15087878704071, -0.22698424756527, 0.26984879374504, -0.25798314809799, 0.19697664678097, 493.84338378906, 21.0, 5.0, -0.18329939246178, 0.24853050708771, -0.27229183912277, 0.24290765821934, -0.17401729524136, 508.31408691406, 22.0, 5.0, 0.21092113852501, -0.26251438260078, 0.26857560873032, -0.22599314153194, 0.15339343249798, 523.20880126953, 22.0, 5.0, 0.16507837176323, -0.23275561630726, 0.26998636126518, -0.26082709431648, 0.20888784527779, 538.5400390625, 23.0, 5.0, -0.1904215067625, 0.24893349409103, -0.27232444286346, 0.25086954236031, -0.1929499655962, 554.32043457031, 24.0, 5.0, 0.21142742037773, -0.26005893945694, 0.2710736989975, -0.23995125293732, 0.17832747101784, 570.56329345703, 24.0, 6.0, 0.16576135158539, -0.22847180068493, 0.26698485016823, -0.26744011044502, 0.22940169274807, -0.16623301804066, 587.28204345703, 25.0, 6.0, -0.18519788980484, 0.24155992269516, -0.27072870731354, 0.26258423924446, -0.21968826651573, 0.15619233250618, 604.49072265625, 26.0, 5.0, 0.20146790146828, -0.25127813220024, 0.27222722768784, -0.25731167197227, 0.21118307113647, 622.20367431641, 26.0, 6.0, 0.15498597919941, -0.21485531330109, 0.25824591517448, -0.27222710847855, 0.25228598713875, -0.20436134934425, 640.43560791016, 27.0, 6.0, -0.16935476660728, 0.22546464204788, -0.26307973265648, 0.27142012119293, -0.24785669147968, 0.19906789064407, 659.20184326172, 28.0, 6.0, 0.18156783282757, -0.23375019431114, 0.26628631353378, -0.27025789022446, 0.24438846111298, -0.19561214745045, 678.51788330078, 29.0, 6.0, -0.19143010675907, 0.23999010026455, -0.26836556196213, 0.26912450790405, -0.24191379547119, 0.19365119934082, 698.40002441406, 30.0, 6.0, 0.19955766201019, -0.24459460377693, 0.26955115795135, -0.26822528243065, 0.24078898131847, -0.19379010796547, 718.86468505859, 30.0, 7.0, 0.15277582406998, -0.20546655356884, 0.24775779247284, -0.2702928185463, 0.26774010062218, -0.24056351184845, 0.19492031633854, 739.92901611328, 31.0, 7.0, -0.15909992158413, 0.20978228747845, -0.24976621568203, 0.27062928676605, -0.26768815517426, 0.24147422611713, -0.19761124253273, 761.61059570312, 32.0, 8.0, 0.16388531029224, -0.21264813840389, 0.25077319145203, -0.2706495821476, 0.26805692911148, -0.24342377483845, 0.20174014568329, -0.1511417478323, 783.92749023438, 33.0, 8.0, -0.16684094071388, 0.21402241289616, -0.25088647007942, 0.27045285701752, -0.26879078149796, 0.24612839519978, -0.20682106912136, 0.15817934274673, 806.89831542969, 34.0, 8.0, 0.16843947768211, -0.21418637037277, 0.25016072392464, -0.26992872357368, 0.26974511146545, -0.24955086410046, 0.21301606297493, -0.16660664975643, 830.54223632812, 35.0, 8.0, -0.16875958442688, 0.2132074534893, -0.24861004948616, 0.26901066303253, -0.27077317237854, 0.25349435210228, -0.22012905776501, 0.17628447711468, 854.87896728516, 36.0, 8.0, 0.16749861836433, -0.21095895767212, 0.24620833992958, -0.26765897870064, 0.27171152830124, -0.25760596990585, 0.2276210039854, -0.18656070530415, 879.92883300781, 37.0, 9.0, -0.16511289775372, 0.20765148103237, -0.24291795492172, 0.2656669318676, -0.27231448888779, 0.26173496246338, -0.23552852869034, 0.19768470525742, -0.15372595191002, 905.71276855469, 38.0, 9.0, 0.16169081628323, -0.20332650840282, 0.23869861662388, -0.26289293169975, 0.27234250307083, -0.26557120680809, 0.24351790547371, -0.20935723185539, 0.16785718500614, 932.25213623047, 39.0, 9.0, -0.15684001147747, 0.19774471223354, -0.23342713713646, 0.25924882292747, -0.27164146304131, 0.2688056230545, -0.25107821822166, 0.22088022530079, -0.18225306272507, 959.56921386719, 40.0, 10.0, 0.15107434988022, -0.19116370379925, 0.22709855437279, -0.25452899932861, 0.26991358399391, -0.27116876840591, 0.25806674361229, -0.23229044675827, 0.19713185727596, -0.15689721703529, 987.68676757812, 42.0, 9.0, 0.18327641487122, -0.21953377127647, 0.24861861765385, -0.267015427351, 0.27239283919334, -0.26402062177658, 0.24290898442268, -0.21163889765739, 0.17391745746136, 1016.6281738281, 43.0, 10.0, -0.17489019036293, 0.21106620132923, -0.24143220484257, 0.26259052753448, -0.27204996347427, 0.26864087581635, -0.25271877646446, 0.22611452639103, -0.19183912873268, 0.15359972417355, 1046.4176025391, 44.0, 10.0, 0.16528110206127, -0.20132787525654, 0.23287628591061, -0.25665345788002, 0.27005317807198, -0.27154159545898, 0.26090463995934, -0.23929013311863, 0.20903493463993, -0.1733081638813, 1077.080078125, 45.0, 11.0, -0.1549823731184, 0.19060122966766, -0.22298394143581, 0.24903470277786, -0.26610746979713, 0.2723890542984, -0.26717123389244, 0.25096333026886, -0.22542381286621, 0.19312188029289, -0.15717014670372, 1108.6408691406, 47.0, 10.0, -0.17855942249298, 0.21157969534397, -0.23965832591057, 0.26014658808708, -0.27101746201515, 0.27114999294281, -0.26049226522446, 0.24007475376129, -0.21187116205692, 0.1785286962986, 1141.1265869141, 48.0, 11.0, 0.16570693254471, -0.19891761243343, 0.22853666543961, -0.25198522210121, 0.26711076498032, -0.27246859669685, 0.26751658320427, -0.25269261002541, 0.22936078906059, -0.19963520765305, 0.16610756516457, 1174.5640869141, 49.0, 12.0, -0.15224272012711, 0.18517026305199, -0.21578685939312, 0.2416495680809, -0.26056653261185, 0.27086293697357, -0.27159124612808, 0.2626541852951, -0.24482144415379, 0.219637170434, -0.1892311424017, 0.15606163442135, 1208.9814453125, 51.0, 11.0, -0.17062485218048, 0.20165444910526, -0.22929090261459, 0.25138777494431, -0.26614120602608, 0.27229952812195, -0.26931366324425, 0.25740596652031, -0.23754784464836, 0.21134878695011, -0.18087150156498, 1244.4073486328, 52.0, 12.0, 0.15490844845772, -0.1859604716301, 0.2148972004652, -0.23965758085251, 0.25837394595146, -0.26957401633263, 0.27234518527985, -0.26643964648247, 0.25230541825294, -0.23103898763657, 0.20426565408707, -0.17396283149719, 1280.8712158203, 54.0, 12.0, 0.16930417716503, -0.19884450733662, 0.22553284466267, -0.24752272665501, 0.26321679353714, -0.27143257856369, 0.27152851223946, -0.26347473263741, 0.24785888195038, -0.22582599520683, 0.19896008074284, -0.16912166774273, 1318.4036865234, 55.0, 13.0, -0.15209156274796, 0.18154031038284, -0.2093725502491, 0.23383848369122, -0.25330862402916, 0.26642981171608, -0.27225914597511, 0.27035987377167, -0.26084727048874, 0.24437962472439, -0.22209414839745, 0.19549597799778, -0.16631288826466, 1357.0357666016, 57.0, 13.0, -0.16346737742424, 0.19165530800819, -0.21773672103882, 0.24013386666775, -0.25742104649544, 0.26845473051071, -0.27248111367226, 0.26920872926712, -0.25883829593658, 0.24204578995705, -0.21992054581642, 0.19386520981789, -0.16546854376793, 1396.8000488281, 59.0, 13.0, -0.17294999957085, 0.199776917696, -0.22417466342449, 0.2447345405817, -0.26021334528923, 0.26964092254639, -0.27240630984306, 0.26831379532814, -0.25760248303413, 0.24092683196068, -0.21930070221424, 0.19400994479656, -0.16650302708149, 1437.7293701172, 60.0, 14.0, 0.15306411683559, -0.18000400066376, 0.20567262172699, -0.22872710227966, 0.24789218604565, -0.26206192374229, 0.27039080858231, -0.2723653614521, 0.26784870028496, -0.25709408521652, 0.24072498083115, -0.21968439221382, 0.19515787065029, -0.16847777366638, 1479.8580322266, 62.0, 14.0, 0.15939593315125, -0.1854277998209, 0.20999644696712, -0.23187245428562, 0.24990351498127, -0.26310175657272, 0.27072104811668, -0.27231666445732, 0.26778203248978, -0.25735864043236, 0.24161818623543, -0.22141842544079, 0.19783695042133, -0.17208893597126, 1523.2211914062, 64.0, 15.0, 0.16417317092419, -0.18929064273834, 0.21285337209702, -0.23374073207378, 0.25091001391411, -0.26347130537033, 0.27075320482254, -0.27235376834869, 0.26817184686661, -0.25841599702835, 0.24359002709389, -0.22445648908615, 0.20198112726212, -0.17726321518421, 0.15145771205425, 1567.8549804688, 66.0, 15.0, 0.16676767170429, -0.19120110571384, 0.21407033503056, -0.23433578014374, 0.2510330080986, -0.26333874464035, 0.27062886953354, -0.27252316474915, 0.26891329884529, -0.25997158885002, 0.24613957107067, -0.22809718549252, 0.20671561360359, -0.18299704790115, 0.15800699591637, 1613.7966308594, 68.0, 15.0, 0.16874767839909, -0.19233712553978, 0.21441145241261, -0.23402765393257, 0.250309497118, -0.26250377297401, 0.27003014087677, -0.27252006530762, 0.26984256505966, -0.26211369037628, 0.24968983232975, -0.23314444720745, 0.21323081851006, -0.19083306193352, 0.16690973937511, 1661.0844726562, 70.0, 16.0, 0.16869451105595, -0.19168373942375, 0.21326290071011, -0.23255985975266, 0.24875985085964, -0.26115506887436, 0.26918876171112, -0.27249079942703, 0.270901709795, -0.26448354125023, 0.25351655483246, -0.23848222196102, 0.22003316879272, -0.19895304739475, 0.17610867321491, -0.15239842236042, 1709.7579345703, 72.0, 16.0, 0.16743217408657, -0.18985477089882, 0.21101206541061, -0.23009897768497, 0.24635696411133, -0.25911739468575, 0.26784092187881, -0.27214986085892, 0.27185133099556, -0.26694932579994, 0.25764518976212, -0.24432593584061, 0.2275415956974, -0.20797297358513, 0.18639212846756, -0.16361847519875, 1759.8576660156, 74.0, 17.0, 0.16503769159317, -0.18691226840019, 0.2076960504055, -0.2266481667757, 0.24306264519691, -0.25630640983582, 0.26585423946381, -0.2713183760643, 0.27247089147568, -0.26925700902939, 0.26179879903793, -0.25038862228394, 0.23547321557999, -0.21762864291668, 0.19752885401249, -0.17590893805027, 0.15352612733841, 1811.4255371094, 76.0, 17.0, 0.16159874200821, -0.18292513489723, 0.20335514843464, -0.2222101688385, 0.23883493244648, -0.25263056159019, 0.2630854845047, -0.26980239152908, 0.27251985669136, -0.27112647891045, 0.2656674683094, -0.25634267926216, 0.24349628388882, -0.22759887576103, 0.2092230618, -0.18901383876801, 0.16765601933002, 1864.5042724609, 78.0, 18.0, 0.15721781551838, -0.17797607183456, 0.19804249703884, -0.21679958701134, 0.23364236950874, -0.24800679087639, 0.25939682126045, -0.26740896701813, 0.27175253629684, -0.27226465940475, 0.26891884207726, -0.26182672381401, 0.25123304128647, -0.23750366270542, 0.2211077362299, -0.20259490609169, 0.18256881833076, -0.16165865957737, 1919.1384277344, 80.0, 19.0, 0.15093757212162, -0.17127278447151, 0.19114154577255, -0.20997284352779, 0.22719809412956, -0.24227632582188, 0.254718542099, -0.26411062479019, 0.27013275027275, -0.27257505059242, 0.27134776115417, -0.2664860188961, 0.2581484913826, -0.2466099858284, 0.2322488874197, -0.21552939713001, 0.19698020815849, -0.17717032134533, 0.15668377280235, 1975.3735351562, 83.0, 19.0, -0.16365346312523, 0.1832550317049, -0.20208945870399, 0.2196274548769, -0.23535519838333, 0.24879615008831, -0.25953176617622, 0.26722022891045, -0.27161175012589, 0.27256017923355, -0.27002981305122, 0.26409727334976, -0.25494822859764, 0.24286930263042, -0.22823525965214, 0.21149258315563, -0.19313986599445, 0.17370648682117, -0.15373024344444, 2033.2563476562, 85.0, 20.0, -0.15621455013752, 0.17526657879353, -0.19380655884743, 0.21135953068733, -0.22745509445667, 0.24164561927319, -0.25352430343628, 0.26274186372757, -0.26902109384537, 0.27216884493828, -0.27208429574966, 0.26876360177994, -0.26230031251907, 0.25288173556328, -0.24078133702278, 0.22634743154049, -0.20998899638653, 0.19215907156467, -0.17333661019802, 0.15400771796703, 2092.8352050781, 88.0, 20.0, 0.16566988825798, -0.18399655818939, 0.20163354277611, -0.21814498305321, 0.23310601711273, -0.24611864984035, 0.25682696700096, -0.26493108272552, 0.27019903063774, -0.27247628569603, 0.27169206738472, -0.26786255836487, 0.26109045743942, -0.25156110525131, 0.23953546583652, -0.22533996403217, 0.20935381948948, -0.1919946372509, 0.1737025231123, -0.15492387115955, 2154.16015625, 90.0, 21.0, 0.15542335808277, -0.17340050637722, 0.19096428155899, -0.20771734416485, 0.22326354682446, -0.23722164332867, 0.24923877418041, -0.25900331139565, 0.26625636219978, -0.27080157399178, 0.27251264452934, -0.27133822441101, 0.26730427145958, -0.26051306724548, 0.25113978981972, -0.23942606151104, 0.22567115724087, -0.21022111177444, 0.19345627725124, -0.17577776312828, 0.15759339928627, 2217.2817382812, 93.0, 21.0, -0.16100199520588, 0.17851342260838, -0.19552144408226, 0.21165303885937, -0.22653986513615, 0.23983047902584, -0.25120237469673, 0.2603731751442, -0.26711067557335, 0.27124106884003, -0.27265554666519, 0.27131405472755, -0.26724708080292, 0.26055464148521, -0.25140282511711, 0.24001801013947, -0.2266788482666, 0.21170662343502, -0.19545415043831, 0.17829370498657, -0.16060465574265, 2282.2531738281, 96.0, 21.0, 0.16612805426121, -0.18297202885151, 0.19925624132156, -0.21464246511459, 0.22879876196384, -0.2414098829031, 0.25218737125397, -0.26087909936905, 0.2672775387764, -0.27122694253922, 0.27262869477272, -0.27144473791122, 0.2676990032196, -0.26147690415382, 0.25292244553566, -0.24223372340202, 0.22965621948242, -0.21547494828701, 0.20000512897968, -0.18358208239079, 0.16655072569847, 2349.1281738281, 98.0, 23.0, 0.1520848274231, -0.1687368452549, 0.18512618541718, -0.20094072818756, 0.21586608886719, -0.22959470748901, 0.24183510243893, -0.25232076644897, 0.26081851124763, -0.26713585853577, 0.27112719416618, -0.27269864082336, 0.27181097865105, -0.26848122477531, 0.26278212666512, -0.25483980774879, 0.24483007192612, -0.23297266662121, 0.21952459216118, -0.20477199554443, 0.18902154266834, -0.17259100079536, 0.15580002963543, 2417.962890625, 101.0, 23.0, -0.15503957867622, 0.17108434438705, -0.18684224784374, 0.20203219354153, -0.21637187898159, 0.22958540916443, -0.24141095578671, 0.2516083419323, -0.25996592640877, 0.26630693674088, -0.27049478888512, 0.27243721485138, -0.27208921313286, 0.26945436000824, -0.2645850777626, 0.25758099555969, -0.24858610332012, 0.23778466880322, -0.22539579868317, 0.2116671204567, -0.19686771929264, 0.18128046393394, -0.16519410908222, 2488.8146972656, 104.0, 24.0, 0.15541876852512, -0.17104130983353, 0.18639309704304, -0.20121467113495, 0.21524529159069, -0.22822964191437, 0.23992455005646, -0.25010561943054, 0.25857335329056, -0.26515871286392, 0.26972803473473, -0.27218672633171, 0.27248221635818, -0.27060532569885, 0.26659080386162, -0.26051640510559, 0.25250065326691, -0.24269980192184, 0.23130328953266, -0.21852867305279, 0.20461562275887, -0.18981948494911, 0.17440442740917, -0.15863656997681, 2561.7424316406, 107.0, 25.0, -0.15459164977074, 0.1697942763567, -0.18476057052612, 0.19925229251385, -0.21302938461304, 0.2258558422327, -0.2375056296587, 0.2477683275938, -0.25645470619202, 0.26340162754059, -0.26847651600838, 0.27158078551292, -0.27265274524689, 0.2716691493988, -0.26864603161812, 0.26363831758499, -0.25673839449883, 0.24807377159595, -0.23780365288258, 0.2261148840189, -0.21321707963943, 0.19933713972569, -0.18471360206604, 0.16959057748318, -0.15421183407307, 2636.8073730469, 110.0, 26.0, 0.1526392698288, -0.16741943359375, 0.1820116341114, -0.19619832932949, 0.20975944399834, -0.22247737646103, 0.23414205014706, -0.2445560246706, 0.25353920459747, -0.26093333959579, 0.26660606265068, -0.27045413851738, 0.27240625023842, -0.2724247276783, 0.27050670981407, -0.26668420433998, 0.26102343201637, -0.25362303853035, 0.24461188912392, -0.23414573073387, 0.22240342199802, -0.20958258211613, 0.19589473307133, -0.18156032264233, 0.1668034940958, -0.15184693038464, 2714.0715332031, 114.0, 26.0, 0.164003059268, -0.17822082340717, 0.19211119413376, -0.20547352731228, 0.21810795366764, -0.22981986403465, 0.24042421579361, -0.24974970519543, 0.25764280557632, -0.26397135853767, 0.26862767338753, -0.27153122425079, 0.27263054251671, -0.2719044983387, 0.2693629860878, -0.26504656672478, 0.25902581214905, -0.25139936804771, 0.24229200184345, -0.23185144364834, 0.22024509310722, -0.20765620470047, 0.19427964091301, -0.18031753599644, 0.16597481071949, -0.15145480632782, 2793.6000976562, 117.0, 27.0, -0.15964557230473, 0.17347618937492, -0.18706221878529, 0.20022197067738, -0.21277306973934, 0.22453613579273, -0.23533853888512, 0.24501803517342, -0.25342634320259, 0.26043224334717, -0.26592469215393, 0.26981517672539, -0.27203980088234, 0.27256077528, -0.27136731147766, 0.26847591996193, -0.26393011212349, 0.25779947638512, -0.25017818808556, 0.24118301272392, -0.23095066845417, 0.21963495016098, -0.20740336179733, 0.1944335848093, -0.1809097379446, 0.16701848804951, -0.15294533967972, 2875.4587402344, 120.0, 28.0, 0.15286682546139, -0.16646575927734, 0.17991957068443, -0.19305920600891, 0.20571325719357, -0.21771124005318, 0.22888696193695, -0.23908187448978, 0.24814826250076, -0.25595241785049, 0.26237735152245, -0.26732534170151, 0.27072009444237, -0.27250835299492, 0.27266103029251, -0.27117398381233, 0.2680681347847, -0.26338893175125, 0.25720557570457, -0.24960950016975, 0.24071243405342, -0.23064412176609, 0.2195495814085, -0.20758613944054, 0.19492018222809, -0.18172383308411, 0.16817146539688, -0.15443640947342, 2959.7160644531, 124.0, 28.0, 0.15995544195175, -0.17303571105003, 0.18590454757214, -0.19840829074383, 0.21039246022701, -0.22170448303223, 0.23219656944275, -0.24172852933407, 0.25017037987709, -0.25740501284599, 0.26333039999008, -0.26786172389984, 0.27093309164047, -0.27249881625175, 0.27253445982933, -0.27103742957115, 0.26802688837051, -0.26354360580444, 0.25764906406403, -0.25042435526848, 0.24196852743626, -0.2323967218399, 0.22183792293072, -0.2104324400425, 0.19832922518253, -0.18568310141563, 0.17265182733536, -0.15939320623875, 3046.4423828125, 127.0, 30.0, -0.15120516717434, 0.16404996812344, -0.17679078876972, 0.18928621709347, -0.20139236748219, 0.21296538412571, -0.2238639742136, 0.23395182192326, -0.2431001663208, 0.25119006633759, -0.25811466574669, 0.26378127932549, -0.26811301708221, 0.27105036377907, -0.27255228161812, 0.27259707450867, -0.27118280529976, 0.2683273255825, -0.26406800746918, 0.2584610581398, -0.25158044695854, 0.24351647496223, -0.23437421023846, 0.22427146136761, -0.21333657205105, 0.20170615613461, -0.18952257931232, 0.17693139612675, -0.16407887637615, 0.15110941231251, 3135.7099609375, 131.0, 30.0, -0.15411147475243, 0.16664104163647, -0.17904591560364, 0.19119389355183, -0.20295096933842, 0.2141834795475, -0.22476038336754, 0.23455548286438, -0.24344952404499, 0.25133243203163, -0.25810512900352, 0.26368138194084, -0.26798930764198, 0.27097281813622, -0.27259248495102, 0.27282637357712, -0.27167049050331, 0.26913872361183, -0.26526284217834, 0.26009169220924, -0.25369048118591, 0.24613957107067, -0.23753306269646, 0.22797708213329, -0.21758790314198, 0.20649001002312, -0.19481381773949, 0.18269349634647, -0.17026476562023, 0.15766255557537, 3227.5932617188, 135.0, 31.0, -0.15729945898056, 0.16932290792465, -0.18120564520359, 0.19282975792885, -0.20407597720623, 0.21482549607754, -0.22496183216572, 0.23437263071537, -0.24295145273209, 0.25059953331947, -0.25722745060921, 0.26275649666786, -0.26712015271187, 0.27026516199112, -0.27215242385864, 0.27275770902634, -0.27207216620445, 0.27010238170624, -0.26687034964561, 0.26241320371628, -0.25678247213364, 0.25004336237907, -0.24227364361286, 0.23356239497662, -0.22400848567486, 0.21371905505657, -0.2028077095747, 0.19139274954796, -0.17959530651569, 0.16753740608692, -0.15534014999866, 3322.1689453125, 139.0, 32.0, -0.15762501955032, 0.16933570802212, -0.18091160058975, 0.19224378466606, -0.20322218537331, 0.21373711526394, -0.22368091344833, 0.23294949531555, -0.24144396185875, 0.24907213449478, -0.25574997067451, 0.26140287518501, -0.26596692204475, 0.26938983798027, -0.27163189649582, 0.27266654372215, -0.27248087525368, 0.27107581496239, -0.26846608519554, 0.26468020677567, -0.25975972414017, 0.25375884771347, -0.24674351513386, 0.23879028856754, -0.22998525202274, 0.22042267024517, -0.21020351350307, 0.19943392276764, -0.1882236301899, 0.17668429017067, -0.16492791473866, 0.15306517481804, 3419.5158691406, 143.0, 33.0, -0.15665097534657, 0.16804347932339, -0.1793215572834, 0.1903852969408, -0.20113350450993, 0.21146506071091, -0.22128030657768, 0.23048248887062, -0.23897908627987, 0.24668316543102, -0.25351467728615, 0.25940164923668, -0.26428127288818, 0.26810076832771, -0.27081835269928, 0.27240380644798, -0.2728388607502, 0.27211767435074, -0.27024683356285, 0.26724520325661, -0.26314389705658, 0.25798550248146, -0.25182378292084, 0.24472263455391, -0.2367552369833, 0.22800303995609, -0.21855443716049, 0.2085036188364, -0.19794911146164, 0.18699242174625, -0.17573663592339, 0.16428489983082, -0.15273912250996, 3519.7153320312, 147.0, 34.0, -0.1546519100666, 0.16573037207127, -0.17671842873096, 0.18752492964268, -0.19805736839771, 0.20822295546532, -0.21792997419834, 0.22708883881569, -0.23561337590218, 0.24342201650143, -0.25043883919716, 0.25659468770027, -0.26182812452316, 0.26608633995056, -0.26932582259178, 0.27151310443878, -0.27262517809868, 0.27264985442162, -0.27158588171005, 0.26944318413734, -0.26624244451523, 0.26201510429382, -0.25680273771286, 0.25065651535988, -0.2436365634203, 0.23581103980541, -0.22725522518158, 0.21805049479008, -0.20828320086002, 0.19804349541664, -0.18742409348488, 0.1765191257, -0.16542281210423, 0.15422832965851, 3622.8510742188, 151.0, 35.0, -0.15151736140251, 0.16226625442505, -0.17295825481415, 0.18351089954376, -0.19384008646011, 0.20386108756065, -0.21348960697651, 0.22264271974564, -0.23123998939991, 0.23920446634293, -0.24646370112896, 0.25295066833496, -0.25860464572906, 0.26337206363678, -0.26720717549324, 0.27007275819778, -0.27194052934647, 0.27279162406921, -0.27261686325073, 0.2714167535305, -0.26920172572136, 0.26599186658859, -0.2618165910244, 0.25671452283859, -0.2507326900959, 0.24392610788345, -0.23635698854923, 0.22809393703938, -0.21921108663082, 0.20978710055351, -0.19990417361259, 0.18964703381062, -0.17910180985928, 0.16835504770279, -0.15749259293079, 3729.0085449219, 156.0, 36.0, 0.15798066556454, -0.16837210953236, 0.17866483330727, -0.18878296017647, 0.19864962995052, -0.20818793773651, 0.21732179820538, -0.22597679495811, 0.23408104479313, -0.24156615138054, 0.24836793541908, -0.25442731380463, 0.2596909403801, -0.26411193609238, 0.26765051484108, -0.27027437090874, 0.27195927500725, -0.27268922328949, 0.27245673537254, -0.27126294374466, 0.26911759376526, -0.26603898406029, 0.26205363869667, -0.25719606876373, 0.25150835514069, -0.24503956735134, 0.23784522712231, -0.22998657822609, 0.22152988612652, -0.21254560351372, 0.20310752093792, -0.19329193234444, 0.18317668139935, -0.17284026741982, 0.16236098110676, -0.15181601047516, 3838.2768554688, 160.0, 37.0, 0.15075358748436, -0.16099792718887, 0.17119784653187, -0.18128231167793, 0.19117887318134, -0.20081450045109, 0.21011634171009, -0.21901254355907, 0.22743304073811, -0.2353103607893, 0.24258045852184, -0.24918335676193, 0.25506398081779, -0.26017275452614, 0.26446616649628, -0.26790732145309, 0.2704664170742, -0.27212113142014, 0.27285680174828, -0.27266663312912, 0.27155187726021, -0.26952171325684, 0.26659324765205, -0.26279118657112, 0.25814759731293, -0.25270158052444, 0.2464987039566, -0.23959055542946, 0.23203405737877, -0.22389078140259, 0.21522635221481, -0.20610950887203, 0.19661147892475, -0.18680503964424, 0.1767638027668, -0.16656132042408, 0.15627035498619, 3950.7470703125, 165.0, 38.0, -0.15448272228241, 0.16436767578125, -0.17419154942036, 0.18388983607292, -0.19339695572853, 0.20264691114426, -0.21157392859459, 0.2201132029295, -0.22820153832436, 0.23577807843685, -0.24278488755226, 0.2491676658392, -0.2548762857914, 0.25986543297768, -0.26409506797791, 0.26753088831902, -0.27014470100403, 0.27191486954689, -0.2728263437748, 0.2728710770607, -0.27204802632332, 0.27036309242249, -0.26782920956612, 0.26446613669395, -0.26030015945435, 0.25536400079727, -0.24969623982906, 0.24334101378918, -0.23634751141071, 0.22876940667629, -0.22066424787045, 0.21209286153316, -0.2031187415123, 0.19380721449852, -0.18422493338585, 0.17443902790546, -0.16451649367809, 0.15452347695827, 4066.5126953125, 170.0, 39.0, 0.15705187618732, -0.16657756268978, 0.17603161931038, -0.1853559166193, 0.19449153542519, -0.20337925851345, 0.21196021139622, -0.22017633914948, 0.22797103226185, -0.23528972268105, 0.24208034574986, -0.24829396605492, 0.25388523936272, -0.25881284475327, 0.26304000616074, -0.2665348649025, 0.26927074790001, -0.27122655510902, 0.27238690853119, -0.27274236083031, 0.27228954434395, -0.27103111147881, 0.26897582411766, -0.26613837480545, 0.26253938674927, -0.2582049369812, 0.25316661596298, -0.2474609464407, 0.24112911522388, -0.23421655595303, 0.22677244246006, -0.21884921193123, 0.21050204336643, -0.20178824663162, 0.19276678562164, -0.18349757790565, 0.17404101788998, -0.16445733606815, 0.15480606257915, 4185.6704101562, 175.0, 40.0, -0.15618322789669, 0.16552640497684, -0.17480699717999, 0.18397036194801, -0.19296108186245, 0.20172345638275, -0.21020197868347, 0.21834187209606, -0.22608959674835, 0.23339337110519, -0.2402036935091, 0.24647377431393, -0.25216004252434, 0.25722253322601, -0.26162537932396, 0.26533704996109, -0.26833075284958, 0.27058470249176, -0.27208229899406, 0.27281242609024, -0.27276933193207, 0.27195292711258, -0.27036872506142, 0.2680276632309, -0.26494619250298, 0.26114597916603, -0.2566536962986, 0.25150084495544, -0.24572332203388, 0.23936119675636, -0.23245818912983, 0.22506132721901, -0.21722044050694, 0.20898766815662, -0.20041701197624, 0.19156378507614, -0.18248404562473, 0.17323417961597, -0.16387028992176, 0.15444774925709, 4308.3203125, 180.0, 41.0, 0.15623946487904, -0.16521276533604, 0.17413151264191, -0.18294727802277, 0.191610917449, -0.20007292926311, 0.20828382670879, -0.21619462966919, 0.22375725209713, -0.23092494904995, 0.23765271902084, -0.24389770627022, 0.2496196180582, -0.25478106737137, 0.25934794545174, -0.26328974962234, 0.26657983660698, -0.26919573545456, 0.27111932635307, -0.27233695983887, 0.27283975481987, -0.27262359857559, 0.27168905735016, -0.27004170417786, 0.26769173145294, -0.26465409994125, 0.26094827055931, -0.25659814476967, 0.25163170695305, -0.24608089029789, 0.2399812489748, -0.23337158560753, 0.22629365324974, -0.21879176795483, 0.21091240644455, -0.20270374417305, 0.1942153275013, -0.18549752235413, 0.17660117149353, -0.16757707297802, 0.15847563743591, 4434.5634765625, 185.0, 43.0, -0.15301859378815, 0.16180841624737, -0.17056375741959, 0.17923960089684, -0.18779012560844, 0.19616904854774, -0.2043299227953, 0.21222664415836, -0.21981373429298, 0.22704672813416, -0.23388260602951, 0.24028012156487, -0.24620017409325, 0.25160613656044, -0.25646424293518, 0.26074373722076, -0.26441738009453, 0.2674615085125, -0.26985630393028, 0.27158597111702, -0.27263900637627, 0.27300807833672, -0.27269026637077, 0.27168709039688, -0.27000439167023, 0.26765239238739, -0.26464560627937, 0.2610025703907, -0.25674593448639, 0.25190198421478, -0.2465006262064, 0.24057501554489, -0.23416128754616, 0.22729825973511, -0.2200270742178, 0.21239085495472, -0.20443433523178, 0.1962034702301, -0.18774503469467, 0.1791062951088, -0.17033453285694, 0.16147673130035, -0.15257915854454, 4564.5063476562, 191.0, 43.0, -0.15732397139072, 0.16590698063374, -0.17443703114986, 0.18287171423435, -0.19116798043251, 0.19928252696991, -0.20717211067677, 0.21479390561581, -0.22210575640202, 0.22906665503979, -0.23563697934151, 0.2417788207531, -0.24745635688305, 0.25263610482216, -0.25728717446327, 0.2613816857338, -0.26489478349686, 0.26780501008034, -0.27009442448616, 0.27174881100655, -0.2727577984333, 0.27311483025551, -0.27281740307808, 0.27186697721481, -0.27026903629303, 0.26803296804428, -0.26517200469971, 0.26170322299004, -0.25764718651772, 0.25302800536156, -0.24787294864655, 0.24221232533455, -0.2360791862011, 0.22950904071331, -0.22253960371017, 0.2152104228735, -0.20756261050701, 0.19963847100735, -0.19148118793964, 0.18313443660736, -0.17464211583138, 0.16604790091515, -0.1573950201273, 4698.2563476562, 196.0, 45.0, 0.15181186795235, -0.16020567715168, 0.16857519745827, -0.17688146233559, 0.18508477509022, -0.19314502179623, 0.20102190971375, -0.20867529511452, 0.21606546640396, -0.22315345704556, 0.22990138828754, -0.23627264797688, 0.24223230779171, -0.2477472871542, 0.25278672575951, -0.25732213258743, 0.26132768392563, -0.26478040218353, 0.26766029000282, -0.26995068788528, 0.27163815498352, -0.27271273732185, 0.27316799759865, -0.27300116419792, 0.27221298217773, -0.27080789208412, 0.26879379153252, -0.26618218421936, 0.26298797130585, -0.25922936201096, 0.25492763519287, -0.25010713934898, 0.24479494988918, -0.23902073502541, 0.23281647264957, -0.22621622681618, 0.21925581991673, -0.21197266876698, 0.20440535247326, -0.19659344851971, 0.18857708573341, -0.18039679527283, 0.17209310829639, -0.1637062728405, 0.15527598559856, 4835.92578125, 202.0, 46.0, 0.15604564547539, -0.16405299305916, 0.17202101647854, -0.17991550266743, 0.18770171701908, -0.19534459710121, 0.20280903577805, -0.21006010472775, 0.21706326305866, -0.2237846404314, 0.23019124567509, -0.23625120520592, 0.24193403124809, -0.24721077084541, 0.25205427408218, -0.25643935799599, 0.26034304499626, -0.26374468207359, 0.26662611961365, -0.26897183060646, 0.27076908946037, -0.27200800180435, 0.27268156409264, -0.27278581261635, 0.27231979370117, -0.27128556370735, 0.26968824863434, -0.26753589510918, 0.26483952999115, -0.26161301136017, 0.25787290930748, -0.25363847613335, 0.24893139302731, -0.24377572536469, 0.23819766938686, -0.23222534358501, 0.22588869929314, -0.21921914815903, 0.21224950253963, -0.20501360297203, 0.19754615426064, -0.18988245725632, 0.18205818533897, -0.17410911619663, 0.16607089340687, -0.15797878801823, 4977.6293945312, 208.0, 48.0, 0.15645430982113, -0.16424915194511, 0.17200607061386, -0.17969346046448, 0.18727929890156, -0.19473123550415, 0.20201687514782, -0.20910395681858, 0.21596057713032, -0.22255538403988, 0.22885777056217, -0.23483814299107, 0.240468069911, -0.24572044610977, 0.25056979060173, -0.25499233603477, 0.25896614789963, -0.26247143745422, 0.26549056172371, -0.2680082321167, 0.27001157402992, -0.27149021625519, 0.27243641018867, -0.27284508943558, 0.2727138698101, -0.2720430791378, 0.27083572745323, -0.26909756660461, 0.26683703064919, -0.26406511664391, 0.26079532504082, -0.25704368948936, 0.25282841920853, -0.24817006289959, 0.24309112131596, -0.23761606216431, 0.23177102208138, -0.22558376193047, 0.21908332407475, -0.21229998767376, 0.20526492595673, -0.19801013171673, 0.19056807458401, -0.182971611619, 0.17525364458561, -0.16744704544544, 0.15958434343338, -0.15169757604599, 5123.4848632812, 214.0, 49.0, 0.15566246211529, -0.16324438154697, 0.1707943379879, -0.1782833635807, 0.18568204343319, -0.19296069443226, 0.20008951425552, -0.20703880488873, 0.21377910673618, -0.22028143703938, 0.22651739418507, -0.23245941102505, 0.23808093369007, -0.24335649609566, 0.24826200306416, -0.25277483463287, 0.25687396526337, -0.26054015755653, 0.26375609636307, -0.26650646328926, 0.26877799630165, -0.27055975794792, 0.27184301614761, -0.27262136340141, 0.27289083600044, -0.27264988422394, 0.2718993127346, -0.27064248919487, 0.26888504624367, -0.26663506031036, 0.26390290260315, -0.26070123910904, 0.25704482197762, -0.25295054912567, 0.24843719601631, -0.2435254752636, 0.23823772370815, -0.2325978577137, 0.2266311943531, -0.22036427259445, 0.21382473409176, -0.20704106986523, 0.20004250109196, -0.19285875558853, 0.18551993370056, -0.17805628478527, 0.17049798369408, -0.16287505626678, 0.15521709620953, 5273.6147460938, 220.0, 51.0, 0.15375140309334, -0.16111819446087, 0.16846247017384, -0.17575785517693, 0.18297752737999, -0.19009435176849, 0.19708105921745, -0.20391036570072, 0.21055518090725, -0.21698871254921, 0.22318467497826, -0.22911740839481, 0.23476199805737, -0.24009455740452, 0.24509219825268, -0.24973332881927, 0.25399768352509, -0.25786647200584, 0.2613225877285, -0.26435053348541, 0.26693668961525, -0.26906934380531, 0.27073872089386, -0.27193713188171, 0.27265894412994, -0.27290061116219, 0.27266085147858, -0.27194046974182, 0.27074241638184, -0.26907184720039, 0.26693594455719, -0.26434403657913, 0.26130738854408, -0.25783929228783, 0.25395479798317, -0.24967081844807, 0.24500581622124, -0.23997990787029, 0.23461455106735, -0.22893254458904, 0.22295780479908, -0.2167152762413, 0.21023075282574, -0.20353069901466, 0.19664219021797, -0.18959261476994, 0.18240962922573, -0.17512093484402, 0.16775412857533, -0.16033659875393, 0.15289528667927, 5428.1430664062, 226.0, 53.0, 0.15081386268139, -0.15796026587486, 0.16509604454041, -0.17219732701778, 0.17923982441425, -0.1861988902092, 0.19304969906807, -0.19976733624935, 0.20632696151733, -0.2127039283514, 0.21887394785881, -0.22481316328049, 0.23049832880497, -0.23590695858002, 0.24101740121841, -0.24580901861191, 0.25026223063469, -0.25435876846313, 0.25808158516884, -0.26141515374184, 0.26434543728828, -0.26686000823975, 0.26894810795784, -0.27060076594353, 0.27181074023247, -0.27257272601128, 0.27288326621056, -0.2727407515049, 0.27214556932449, -0.27109998464584, 0.26960813999176, -0.26767611503601, 0.26531177759171, -0.26252481341362, 0.25932669639587, -0.25573047995567, 0.25175088644028, -0.24740412831306, 0.24270784854889, -0.23768103122711, 0.23234379291534, -0.22671741247177, 0.22082412242889, -0.21468697488308, 0.20832973718643, -0.20177680253983, 0.19505293667316, -0.18818326294422, 0.18119305372238, -0.17410759627819, 0.16695210337639, -0.15975153446198, 0.15253047645092, 5587.2001953125, 233.0, 54.0, -0.1538732200861, 0.16079318523407, -0.16769434511662, 0.17455488443375, -0.18135258555412, 0.18806499242783, -0.19466951489449, 0.20114350318909, -0.20746442675591, 0.21360991895199, -0.21955794095993, 0.225286886096, -0.23077568411827, 0.23600392043591, -0.24095192551613, 0.24560092389584, -0.24993312358856, 0.25393176078796, -0.25758129358292, 0.26086735725403, -0.26377698779106, 0.26629856228828, -0.26842200756073, 0.27013871073723, -0.2714416384697, 0.27232539653778, -0.27278625965118, 0.27282211184502, -0.27243259549141, 0.27161899209023, -0.27038425207138, 0.26873305439949, -0.26667168736458, 0.26420804858208, -0.26135155558586, 0.25811326503754, -0.25450554490089, 0.25054222345352, -0.24623848497868, 0.24161064624786, -0.23667621612549, 0.2314537614584, -0.22596275806427, 0.2202235609293, -0.21425722539425, 0.20808543264866, -0.20173038542271, 0.19521467387676, -0.18856112658978, 0.18179276585579, -0.17493264377117, 0.16800372302532, -0.16102875769138, 0.15403021872044, 5750.9174804688, 240.0, 55.0, 0.15253645181656, -0.15939876437187, 0.16624811291695, -0.17306330800056, 0.17982272803783, -0.18650455772877, 0.19308678805828, -0.19954738020897, 0.20586434006691, -0.21201585233212, 0.21798035502434, -0.22373673319817, 0.22926431894302, -0.23454307019711, 0.23955366015434, -0.24427758157253, 0.24869722127914, -0.25279602408409, 0.25655844807625, -0.25997018814087, 0.26301822066307, -0.26569077372551, 0.26797753572464, -0.26986965537071, 0.27135968208313, -0.27244183421135, 0.27311182022095, -0.27336695790291, 0.27320620417595, -0.27263009548187, 0.27164080739021, -0.27024212479591, 0.26843938231468, -0.26623949408531, 0.26365092396736, -0.26068350672722, 0.25734859704971, -0.25365883111954, 0.24962821602821, -0.24527184665203, 0.24060606956482, -0.23564818501472, 0.23041647672653, -0.22493010759354, 0.21920895576477, -0.2132735401392, 0.20714493095875, -0.20084466040134, 0.19439454376698, -0.18781660497189, 0.18113298714161, -0.17436580359936, 0.16753707826138, -0.16066856682301, 0.15378174185753, 5919.4321289062, 247.0, 57.0, -0.15297320485115, 0.1596000790596, -0.16621480882168, 0.17279824614525, -0.17933095991611, 0.18579323589802, -0.19216522574425, 0.19842703640461, -0.20455877482891, 0.21054069697857, -0.2163532525301, 0.2219772040844, -0.22739373147488, 0.23258447647095, -0.23753172159195, 0.24221834540367, -0.24662804603577, 0.25074532628059, -0.25455564260483, 0.25804537534714, -0.26120200753212, 0.26401418447495, -0.26647162437439, 0.26856541633606, -0.27028784155846, 0.27163249254227, -0.27259439229965, 0.27316984534264, -0.27335670590401, 0.27315405011177, -0.27256256341934, 0.27158421278, -0.27022239565849, 0.26848196983337, -0.26636910438538, 0.26389127969742, -0.26105731725693, 0.25787726044655, -0.25436240434647, 0.25052514672279, -0.24637897312641, 0.241938367486, -0.23721878230572, 0.23223653435707, -0.22700871527195, 0.22155313193798, -0.21588815748692, 0.21003273129463, -0.20400620996952, 0.19782827794552, -0.1915188729763, 0.18509808182716, -0.17858602106571, 0.1720027923584, -0.16536834836006, 0.15870243310928, -0.15202447772026, 6092.884765625, 254.0, 59.0, 0.1523357629776, -0.1587226241827, 0.16510085761547, -0.17145338654518, 0.17776282131672, -0.18401157855988, 0.19018186628819, -0.19625581800938, 0.2022155970335, -0.20804338157177, 0.21372154355049, -0.21923263370991, 0.22455956041813, -0.22968555986881, 0.23459435999393, -0.23927021026611, 0.24369795620441, -0.24786314368248, 0.25175204873085, -0.25535172224045, 0.25865015387535, -0.26163622736931, 0.26429978013039, -0.26663169264793, 0.26862397789955, -0.27026969194412, 0.27156308293343, -0.27249953150749, 0.27307567000389, -0.27328932285309, 0.27313953638077, -0.27262660861015, 0.27175205945969, -0.27051863074303, 0.2689303457737, -0.26699233055115, 0.26471093297005, -0.26209366321564, 0.25914913415909, -0.25588697195053, 0.25231790542603, -0.24845358729362, 0.2443066239357, -0.23989048600197, 0.23521941900253, -0.23030839860439, 0.22517308592796, -0.21982973814011, 0.214295104146, -0.20858639478683, 0.20272117853165, -0.19671732187271, 0.19059285521507, -0.18436598777771, 0.1780549287796, -0.17167788743973, 0.16525295376778, -0.15879799425602, 0.15233065187931, 6271.419921875, 262.0, 60.0, 0.15396712720394, -0.16028343141079, 0.16658483445644, -0.17285476624966, 0.17907644808292, -0.18523290753365, 0.19130705296993, -0.1972817927599, 0.20314006507397, -0.20886488258839, 0.21443946659565, -0.21984730660915, 0.22507219016552, -0.23009830713272, 0.23491030931473, -0.23949338495731, 0.2438333183527, -0.2479165494442, 0.25173026323318, -0.25526237487793, 0.25850167870522, -0.2614378631115, 0.2640615105629, -0.26636415719986, 0.26833844184875, -0.26997792720795, 0.27127739787102, -0.27223259210587, 0.27284044027328, -0.27309903502464, 0.27300751209259, -0.27256625890732, 0.27177673578262, -0.27064153552055, 0.26916444301605, -0.26735025644302, 0.26520490646362, -0.26273539662361, 0.25994971394539, -0.25685679912567, 0.25346666574478, -0.2497900724411, 0.24583871662617, -0.24162508547306, 0.2371623814106, -0.23246447741985, 0.22754591703415, -0.22242173552513, 0.21710750460625, -0.21161916851997, 0.20597307384014, -0.200185790658, 0.19427412748337, -0.18825502693653, 0.18214549124241, -0.17596250772476, 0.16972301900387, -0.16344377398491, 0.15714137256145, -0.15083207190037, 6455.1865234375, 269.0, 62.0, -0.1509997099638, 0.15708051621914, -0.16315576434135, 0.16921082139015, -0.1752308011055, 0.18120060861111, -0.18710504472256, 0.19292882084846, -0.19865661859512, 0.20427314937115, -0.20976328849792, 0.21511197090149, -0.22030444443226, 0.22532619535923, -0.23016303777695, 0.23480120301247, -0.23922738432884, 0.24342875182629, -0.2473930567503, 0.25110867619514, -0.25456464290619, 0.25775066018105, -0.2606572508812, 0.26327568292618, -0.26559805870056, 0.26761737465858, -0.26932749152184, 0.2707231938839, -0.27180022001266, 0.27255523204803, -0.2729859650135, 0.2730909883976, -0.27287000417709, 0.27232363820076, -0.27145349979401, 0.27026224136353, -0.26875340938568, 0.26693153381348, -0.26480212807655, 0.26237154006958, -0.25964707136154, 0.25663688778877, -0.25334987044334, 0.249795794487, -0.24598513543606, 0.24192905426025, -0.23763938248158, 0.23312856256962, -0.22840954363346, 0.22349579632282, -0.21840123832226, 0.21314017474651, -0.2077271938324, 0.20217718183994, -0.1965052485466, 0.19072660803795, -0.18485659360886, 0.17891053855419, -0.1729037463665, 0.16685146093369, -0.16076873242855, 0.15467044711113, 6644.337890625, 277.0, 64.0, -0.15317618846893, 0.15901686251163, -0.16484838724136, 0.17065772414207, -0.17643161118031, 0.18215663731098, -0.1878192871809, 0.19340595602989, -0.19890303909779, 0.20429696142673, -0.2095742225647, 0.2147214859724, -0.21972553431988, 0.22457344830036, -0.22925253212452, 0.23375044763088, -0.23805522918701, 0.24215529859066, -0.24603959918022, 0.24969753623009, -0.25311908125877, 0.25629475712776, -0.25921580195427, 0.26187404990196, -0.2642619907856, 0.26637294888496, -0.26820087432861, 0.26974058151245, -0.27098765969276, 0.27193850278854, -0.27259030938148, 0.27294114232063, -0.27298992872238, 0.27273643016815, -0.27218124270439, 0.27132585644722, -0.27017259597778, 0.26872456073761, -0.26698577404022, 0.26496097445488, -0.26265579462051, 0.26007655262947, -0.2572303712368, 0.25412499904633, -0.25076895952225, 0.2471714168787, -0.24334211647511, 0.23929139971733, -0.23503014445305, 0.23056975007057, -0.22592201828957, 0.22109922766685, -0.21611395478249, 0.21097910404205, -0.20570789277554, 0.20031368732452, -0.19481006264687, 0.18921069800854, -0.18352933228016, 0.17777973413467, -0.17197561264038, 0.16613063216209, -0.16025829315186, 0.15437194705009, 6839.0317382812, 285.0, 66.0, -0.15050108730793, 0.15626472234726, -0.16202667355537, 0.16777449846268, -0.17349551618099, 0.17917691171169, -0.18480570614338, 0.19036884605885, -0.1958532333374, 0.20124576985836, -0.20653341710567, 0.21170324087143, -0.21674241125584, 0.22163832187653, -0.22637860476971, 0.23095114529133, -0.23534417152405, 0.23954629898071, -0.2435465157032, 0.24733430147171, -0.25089958310127, 0.25423291325569, -0.25732529163361, 0.26016840338707, -0.26275452971458, 0.26507663726807, -0.26712840795517, 0.26890417933464, -0.27039909362793, 0.2716089785099, -0.27253049612045, 0.27316105365753, -0.27349892258644, 0.27354311943054, -0.27329343557358, 0.27275058627129, -0.27191597223282, 0.270791888237, -0.26938134431839, 0.2676882147789, -0.26571705937386, 0.26347324252129, -0.26096281409264, 0.25819256901741, -0.25516995787621, 0.25190305709839, -0.24840062856674, 0.24467195570469, -0.24072688817978, 0.23657581210136, -0.23222954571247, 0.22769938409328, -0.22299697995186, 0.21813434362411, -0.2131237834692, 0.207977861166, -0.20270937681198, 0.1973312497139, -0.19185654819012, 0.18629841506481, -0.18066999316216, 0.17498441040516, -0.16925473511219, 0.16349393129349, -0.15771478414536, 0.15192990005016, 7039.4306640625, 293.0, 69.0, -0.15040524303913, 0.1559089422226, -0.16141238808632, 0.16690473258495, -0.17237496376038, 0.17781190574169, -0.18320423364639, 0.18854056298733, -0.19380941987038, 0.19899933040142, -0.2040988355875, 0.20909652113914, -0.21398106217384, 0.2187412828207, -0.22336615622044, 0.22784486413002, -0.23216681182384, 0.23632170259953, -0.24029955267906, 0.24409070611, -0.24768590927124, 0.25107628107071, -0.25425347685814, 0.25720947980881, -0.25993692874908, 0.26242890954018, -0.26467904448509, 0.26668158173561, -0.26843133568764, 0.26992380619049, -0.27115499973297, 0.27212172746658, -0.27282130718231, 0.27325186133385, -0.27341210842133, 0.2733014523983, -0.2729200720787, 0.2722687125206, -0.2713488638401, 0.27016273140907, -0.26871311664581, 0.26700356602669, -0.26503819227219, 0.26282182335854, -0.26035985350609, 0.25765830278397, -0.25472378730774, 0.25156345963478, -0.24818497896194, 0.24459658563137, -0.24080692231655, 0.23682513833046, -0.2326607555151, 0.22832371294498, -0.22382426261902, 0.21917301416397, -0.21438081562519, 0.20945878326893, -0.20441824197769, 0.19927063584328, -0.19402760267258, 0.18870081007481, -0.18330201506615, 0.17784297466278, -0.17233540117741, 0.16679096221924, -0.16122125089169, 0.15563766658306, -0.15005147457123, 7245.7021484375, 302.0, 70.0, 0.15126127004623, -0.15668739378452, 0.16210985183716, -0.16751824319363, 0.17290203273296, -0.17825053632259, 0.1835530102253, -0.1887985765934, 0.19397640228271, -0.19907559454441, 0.20408533513546, -0.208994820714, 0.21379341185093, -0.21847057342529, 0.22301594913006, -0.22741936147213, 0.23167088627815, -0.23576088249683, 0.23968000710011, -0.24341920018196, 0.24696981906891, -0.25032359361649, 0.2534726858139, -0.25640961527824, 0.25912752747536, -0.26161989569664, 0.26388081908226, -0.26590490341187, 0.26768723130226, -0.26922360062599, 0.27051025629044, -0.27154412865639, 0.27232268452644, -0.27284407615662, 0.27310699224472, -0.27311083674431, 0.27285555005074, -0.27234181761742, 0.27157083153725, -0.27054446935654, 0.26926517486572, -0.26773610711098, 0.26596087217331, -0.26394376158714, 0.2616896033287, -0.25920379161835, 0.25649219751358, -0.25356128811836, 0.25041797757149, -0.24706961214542, 0.24352405965328, -0.2397895604372, 0.23587474226952, -0.23178859055042, 0.22754046320915, -0.22313995659351, 0.2185969799757, -0.21392165124416, 0.20912432670593, -0.20421549677849, 0.19920581579208, -0.19410601258278, 0.1889269053936, -0.18367935717106, 0.17837420105934, -0.17302227020264, 0.16763432323933, -0.16222101449966, 0.15679287910461, -0.15136030316353, 7458.0170898438, 311.0, 72.0, -0.15437451004982, 0.15955467522144, -0.16472679376602, 0.16988177597523, -0.1750103533268, 0.18010319769382, -0.18515086174011, 0.19014389812946, -0.19507278501987, 0.19992803037167, -0.20470015704632, 0.20937974750996, -0.21395748853683, 0.21842414140701, -0.22277061641216, 0.22698800265789, -0.2310675829649, 0.23500081896782, -0.23877945542336, 0.24239549040794, -0.24584120512009, 0.24910922348499, -0.2521924674511, 0.25508427619934, -0.25777831673622, 0.2602686882019, -0.26254987716675, 0.26461684703827, -0.26646500825882, 0.26809021830559, -0.26948881149292, 0.27065765857697, -0.27159407734871, 0.27229589223862, -0.27276155352592, 0.27298989892006, -0.2729803621769, 0.27273288369179, -0.27224797010422, 0.27152660489082, -0.27057036757469, 0.26938125491142, -0.26796185970306, 0.26631528139114, -0.26444506645203, 0.26235526800156, -0.26005044579506, 0.25753554701805, -0.25481605529785, 0.25189781188965, -0.2487870901823, 0.24549055099487, -0.24201522767544, 0.23836849629879, -0.23455806076527, 0.23059192299843, -0.22647838294506, 0.22222594916821, -0.21784342825413, 0.21333974599838, -0.20872405171394, 0.2040056437254, -0.19919392466545, 0.19429838657379, -0.18932858109474, 0.18429413437843, -0.17920462787151, 0.17406968772411, -0.16889882087708, 0.1637015491724, -0.15848723053932, 0.1532651335001, 7676.5537109375, 320.0, 74.0, 0.1521267592907, -0.15721324086189, 0.16229762136936, -0.16737130284309, 0.17242558300495, -0.17745164036751, 0.18244053423405, -0.18738327920437, 0.19227084517479, -0.1970941722393, 0.20184423029423, -0.20651198923588, 0.21108847856522, -0.21556484699249, 0.21993228793144, -0.22418220341206, 0.22830606997013, -0.23229558765888, 0.2361426949501, -0.2398394793272, 0.24337835609913, -0.24675196409225, 0.24995328485966, -0.25297555327415, 0.25581243634224, -0.25845786929131, 0.26090621948242, -0.26315221190453, 0.26519101858139, -0.26701816916466, 0.26862975955009, -0.27002218365669, 0.27119240164757, -0.27213782072067, 0.27285632491112, -0.27334624528885, 0.27360647916794, -0.27363634109497, 0.27343571186066, -0.27300491929054, 0.2723448574543, -0.27145680785179, 0.27034264802933, -0.26900470256805, 0.26744574308395, -0.26566904783249, 0.26367837190628, -0.26147788763046, 0.25907218456268, -0.25646635890007, 0.2536658346653, -0.25067648291588, 0.24750448763371, -0.24415645003319, 0.24063928425312, -0.23696020245552, 0.23312675952911, -0.22914673388004, 0.22502818703651, -0.22077937424183, 0.21640878915787, -0.21192507445812, 0.20733705163002, -0.20265363156796, 0.19788387417793, -0.19303686916828, 0.1881217956543, -0.18314783275127, 0.17812415957451, -0.1730599552393, 0.16796430945396, -0.1628462523222, 0.15771472454071, -0.15257854759693, 7901.494140625, 330.0, 75.0, 0.1542934179306, -0.15928389132023, 0.16426695883274, -0.16923445463181, 0.1741781681776, -0.17908976972103, 0.18396085500717, -0.18878300487995, 0.19354775547981, -0.19824668765068, 0.202871337533, -0.20741336047649, 0.2118644118309, -0.21621629595757, 0.22046089172363, -0.22459022700787, 0.22859650850296, -0.2324720621109, 0.23620948195457, -0.2398015409708, 0.24324123561382, -0.24652189016342, 0.24963702261448, -0.25258052349091, 0.25534653663635, -0.25792959332466, 0.26032450795174, -0.26252648234367, 0.26453113555908, -0.26633441448212, 0.26793268322945, -0.26932269334793, 0.27050167322159, -0.27146723866463, 0.27221742272377, -0.27275070548058, 0.27306601405144, -0.27316275238991, 0.27304074168205, -0.27270022034645, 0.27214190363884, -0.27136698365211, 0.27037703990936, -0.26917409896851, 0.2677606344223, -0.26613956689835, 0.26431414484978, -0.26228809356689, 0.26006552577019, -0.25765091180801, 0.25504913926125, -0.25226536393166, 0.24930514395237, -0.24617436528206, 0.24287919700146, -0.23942612111568, 0.2358218729496, -0.2320734411478, 0.22818805277348, -0.22417315840721, 0.22003637254238, -0.21578553318977, 0.21142855286598, -0.20697355270386, 0.20242869853973, -0.19780227541924, 0.19310264289379, -0.18833814561367, 0.18351718783379, -0.17864818871021, 0.17373950779438, -0.16879945993423, 0.16383631527424, -0.15885825455189, 0.15387330949306, 8133.025390625, 339.0, 79.0, -0.15404440462589, 0.15878859162331, -0.16352719068527, 0.16825325787067, -0.17295970022678, 0.17763935029507, -0.18228499591351, 0.18688939511776, -0.19144523143768, 0.19594521820545, -0.20038206875324, 0.20474849641323, -0.20903727412224, 0.21324123442173, -0.21735328435898, 0.22136643528938, -0.22527377307415, 0.22906854748726, -0.2327441573143, 0.23629412055016, -0.23971219360828, 0.24299228191376, -0.24612851440907, 0.24911524355412, -0.25194707512856, 0.25461888313293, -0.2571257352829, 0.2594630420208, -0.26162654161453, 0.26361218094826, -0.265416264534, 0.26703545451164, -0.26846668124199, 0.26970729231834, -0.27075490355492, 0.27160754799843, -0.27226361632347, 0.27272176742554, -0.27298119664192, 0.27304130792618, -0.27290195226669, 0.27256336808205, -0.27202615141869, 0.27129122614861, -0.27035993337631, 0.26923397183418, -0.26791536808014, 0.26640656590462, -0.26471027731895, 0.262829631567, -0.26076802611351, 0.25852924585342, -0.25611734390259, 0.25353670120239, -0.25079196691513, 0.24788810312748, -0.24483029544353, 0.24162404239178, -0.23827505111694, 0.23478923738003, -0.2311727553606, 0.22743195295334, -0.22357332706451, 0.21960359811783, -0.21552956104279, 0.21135817468166, -0.20709651708603, 0.20275175571442, -0.19833110272884, 0.19384188950062, -0.18929141759872, 0.18468707799911, -0.18003621697426, 0.17534619569778, -0.17062433063984, 0.16587792336941, -0.16111415624619, 0.15634019672871, -0.15156306326389, 8371.3408203125, 349.0, 81.0, -0.15297095477581, 0.15760971605778, -0.1622466146946, 0.1668751090765, -0.17148859798908, 0.17608039081097, -0.18064370751381, 0.18517173826694, -0.18965762853622, 0.19409447908401, -0.19847542047501, 0.2027935385704, -0.20704200863838, 0.21121399104595, -0.21530273556709, 0.21930153667927, -0.22320379316807, 0.22700302302837, -0.23069283366203, 0.23426696658134, -0.2377193570137, 0.24104405939579, -0.24423533678055, 0.24728763103485, -0.25019559264183, 0.25295409560204, -0.25555828213692, 0.25800350308418, -0.26028534770012, 0.26239973306656, -0.26434284448624, 0.26611113548279, -0.26770135760307, 0.2691105902195, -0.27033624053001, 0.27137598395348, -0.27222791314125, 0.27289038896561, -0.27336210012436, 0.27364215254784, -0.27372992038727, 0.27362516522408, -0.27332797646523, 0.27283883094788, -0.27215850353241, 0.27128812670708, -0.27022922039032, 0.26898357272148, -0.2675533592701, 0.26594105362892, -0.26414948701859, 0.26218178868294, -0.26004135608673, 0.25773197412491, -0.25525763630867, 0.25262266397476, -0.24983164668083, 0.24688938260078, -0.24380099773407, 0.24057176709175, -0.23720726370811, 0.23371320962906, -0.23009556531906, 0.22636041045189, -0.22251406311989, 0.21856293082237, -0.21451357007027, 0.21037267148495, -0.20614701509476, 0.20184344053268, -0.19746889173985, 0.19303034245968, -0.18853481113911, 0.18398933112621, -0.17940095067024, 0.17477667331696, -0.17012350261211, 0.16544838249683, -0.16075818240643, 0.15605974197388, -0.1513597369194, 8616.640625, 359.0, 83.0, -0.15143042802811, 0.15597392618656, -0.16051590442657, 0.16505029797554, -0.16957093775272, 0.17407159507275, -0.17854596674442, 0.18298773467541, -0.18739050626755, 0.19174790382385, -0.19605353474617, 0.20030102133751, -0.20448398590088, 0.20859612524509, -0.21263115108013, 0.21658286452293, -0.22044514119625, 0.22421193122864, -0.22787733376026, 0.2314355224371, -0.23488083481789, 0.23820774257183, -0.2414108812809, 0.24448505043983, -0.24742524325848, 0.25022664666176, -0.25288465619087, 0.25539487600327, -0.25775316357613, 0.2599555850029, -0.26199847459793, 0.26387840509415, -0.26559221744537, 0.26713705062866, -0.26851031184196, 0.26970964670181, -0.27073302865028, 0.27157878875732, -0.27224543690681, 0.2727318406105, -0.27303722500801, 0.27316102385521, -0.27310305833817, 0.27286344766617, -0.27244254946709, 0.27184110879898, -0.27106016874313, 0.27010104060173, -0.2689653635025, 0.26765504479408, -0.26617228984833, 0.26451963186264, -0.262699842453, 0.2607159614563, -0.25857135653496, 0.25626954436302, -0.2538143992424, 0.25120997428894, -0.24846056103706, 0.24557070434093, -0.24254512786865, 0.23938874900341, -0.23610670864582, 0.23270426690578, -0.22918692231178, 0.2255602478981, -0.22182999551296, 0.21800203621387, -0.21408234536648, 0.21007700264454, -0.20599216222763, 0.20183406770229, -0.19760897755623, 0.19332325458527, -0.18898321688175, 0.18459525704384, -0.18016573786736, 0.17570102214813, -0.17120742797852, 0.16669124364853, -0.16215872764587, 0.15761601924896, -0.15306924283504, 8869.126953125, 370.0, 85.0, 0.15247046947479, -0.15692572295666, 0.16137982904911, -0.16582700610161, 0.17026145756245, -0.17467723786831, 0.17906841635704, -0.18342895805836, 0.1877528578043, -0.19203402101994, 0.19626639783382, -0.20044393837452, 0.20456057786942, -0.20861031115055, 0.21258716285229, -0.21648523211479, 0.22029867768288, -0.22402173280716, 0.22764874994755, -0.23117414116859, 0.23459251224995, -0.2378985285759, 0.24108703434467, -0.24415305256844, 0.24709172546864, -0.24989840388298, 0.25256863236427, -0.25509810447693, 0.25748279690742, -0.2597188949585, 0.26180273294449, -0.26373094320297, 0.26550042629242, -0.26710826158524, 0.26855182647705, -0.26982879638672, 0.27093705534935, -0.27187478542328, 0.27264043688774, -0.2732327580452, 0.27365076541901, -0.27389380335808, 0.27396142482758, -0.27385357022285, 0.27357038855553, -0.27311235666275, 0.27248024940491, -0.27167508006096, 0.27069818973541, -0.26955118775368, 0.26823598146439, -0.26675468683243, 0.26510977745056, -0.26330390572548, 0.2613400220871, -0.25922131538391, 0.25695124268532, -0.25453343987465, 0.25197181105614, -0.24927046895027, 0.24643371999264, -0.24346606433392, 0.2403722256422, -0.23715704679489, 0.23382557928562, -0.23038300871849, 0.22683465480804, -0.2231860011816, 0.21944259107113, -0.21561013162136, 0.21169438958168, -0.20770120620728, 0.2036365121603, -0.1995062828064, 0.19531650841236, -0.1910732537508, 0.18678256869316, -0.18245050311089, 0.17808310687542, -0.17368641495705, 0.16926640272141, -0.16482901573181, 0.16038013994694, -0.15592557191849, 0.15147104859352, 9129.0126953125, 381.0, 87.0, -0.15286229550838, 0.15719473361969, -0.16152396798134, 0.16584473848343, -0.17015168070793, 0.17443938553333, -0.17870242893696, 0.18293531239033, -0.18713253736496, 0.19128859043121, -0.19539794325829, 0.19945508241653, -0.20345452427864, 0.20739081501961, -0.2112585157156, 0.21505227684975, -0.2187667787075, 0.22239682078362, -0.22593721747398, 0.22938296198845, -0.23272907733917, 0.23597075045109, -0.23910328745842, 0.24212211370468, -0.245022803545, 0.24780111014843, -0.25045290589333, 0.25297430157661, -0.25536152720451, 0.25761100649834, -0.2597194314003, 0.26168358325958, -0.26350054144859, 0.26516756415367, -0.26668214797974, 0.26804199814796, -0.26924508810043, 0.27028957009315, -0.27117389440536, 0.27189674973488, -0.27245700359344, 0.27285385131836, -0.2730867266655, 0.27315527200699, -0.27305939793587, 0.27279928326607, -0.27237537503242, 0.27178832888603, -0.27103909850121, 0.2701288163662, -0.26905891299248, 0.2678310573101, -0.26644715666771, 0.26490929722786, -0.26321986317635, 0.26138144731522, -0.25939685106277, 0.25726905465126, -0.25500130653381, 0.25259700417519, -0.25005975365639, 0.24739336967468, -0.24460180103779, 0.24168917536736, -0.23865978419781, 0.23551808297634, -0.23226863145828, 0.22891613841057, -0.22546544671059, 0.22192148864269, -0.21828930079937, 0.21457400918007, -0.21078082919121, 0.20691502094269, -0.20298193395138, 0.19898694753647, -0.19493545591831, 0.19083292782307, -0.18668480217457, 0.18249653279781, -0.17827358841896, 0.17402140796185, -0.16974540054798, 0.16545091569424, -0.16114330291748, 0.15682782232761, -0.15250967442989, 9396.5126953125, 392.0, 90.0, 0.15147049725056, -0.15572629868984, 0.15998187661171, -0.16423219442368, 0.16847223043442, -0.17269687354565, 0.17690093815327, -0.18107925355434, 0.1852265894413, -0.18933770060539, 0.19340732693672, -0.19743023812771, 0.20140117406845, -0.20531494915485, 0.2091663479805, -0.21295024454594, 0.2166615575552, -0.2202952504158, 0.22384637594223, -0.22731006145477, 0.23068152368069, -0.2339560687542, 0.23712915182114, -0.24019633233547, 0.2431532740593, -0.24599578976631, 0.24871987104416, -0.2513216137886, 0.253797352314, -0.25614348053932, 0.25835666060448, -0.26043370366096, 0.26237159967422, -0.2641676068306, 0.26581907272339, -0.26732367277145, 0.26867917180061, -0.26988366246223, 0.27093541622162, -0.27183291316032, 0.27257484197617, -0.2731602191925, 0.27358821034431, -0.27385818958282, 0.27396988868713, -0.27392312884331, 0.27371805906296, -0.27335506677628, 0.27283474802971, -0.27215790748596, 0.27132561802864, -0.27033916115761, 0.26920008659363, -0.2679101228714, 0.26647120714188, -0.26488551497459, 0.26315546035767, -0.26128363609314, 0.25927278399467, -0.25712594389915, 0.25484624505043, -0.25243702530861, 0.24990186095238, -0.24724440276623, 0.24446851015091, -0.24157816171646, 0.23857752978802, -0.23547084629536, 0.23226253688335, -0.22895711660385, 0.2255591750145, -0.22207345068455, 0.21850474178791, -0.2148579210043, 0.21113795042038, -0.20734982192516, 0.20349860191345, -0.19958937168121, 0.1956272572279, -0.19161739945412, 0.18756495416164, -0.18347506225109, 0.17935286462307, -0.17520347237587, 0.17103196680546, -0.16684341430664, 0.16264280676842, -0.1584350913763, 0.15422512590885, -0.15001773834229, 9671.8515625, 403.0, 94.0, -0.15369634330273, 0.15765596926212, -0.16161467134953, 0.16556839644909, -0.16951304674149, 0.17344444990158, -0.17735843360424, 0.18125073611736, -0.18511709570885, 0.18895323574543, -0.19275486469269, 0.19651764631271, -0.20023727416992, 0.20390944182873, -0.20752985775471, 0.2110942453146, -0.21459837257862, 0.218038007617, -0.22140900790691, 0.22470723092556, -0.22792863845825, 0.23106923699379, -0.23412507772446, 0.23709236085415, -0.23996728658676, 0.24274621903896, -0.24542559683323, 0.248001947999, -0.25047191977501, 0.25283232331276, -0.25508001446724, 0.25721207261086, -0.25922560691833, 0.26111799478531, -0.26288664340973, 0.2645291686058, -0.26604336500168, 0.26742714643478, -0.26867857575417, 0.26979598402977, -0.27077773213387, 0.27162244915962, -0.27232897281647, 0.27289620041847, -0.27332335710526, 0.27360972762108, -0.27375483512878, 0.27375841140747, -0.27362036705017, 0.27334079146385, -0.27291992306709, 0.27235823869705, -0.27165642380714, 0.27081528306007, -0.26983588933945, 0.26871937513351, -0.26746717095375, 0.26608088612556, -0.26456218957901, 0.26291304826736, -0.2611355483532, 0.25923189520836, -0.25720459222794, 0.25505611300468, -0.25278925895691, 0.25040689110756, -0.24791198968887, 0.24530774354935, -0.24259743094444, 0.23978446424007, -0.23687236011028, 0.23386478424072, -0.23076547682285, 0.22757828235626, -0.22430714964867, 0.22095610201359, -0.21752926707268, 0.21403080224991, -0.21046493947506, 0.20683601498604, -0.20314833521843, 0.19940631091595, -0.19561436772346, 0.19177693128586, -0.18789848685265, 0.18398348987103, -0.18003642559052, 0.17606176435947, -0.1720639616251, 0.16804745793343, -0.16401666402817, 0.15997596085072, -0.15592965483665, 0.15188206732273, 9955.2587890625, 414.0, 97.0, 0.15090078115463, -0.15477609634399, 0.15865159034729, -0.1625235080719, 0.16638803482056, -0.17024134099483, 0.1740795224905, -0.17789867520332, 0.18169486522675, -0.18546411395073, 0.18920247256756, -0.19290594756603, 0.19657056033611, -0.20019234716892, 0.20376734435558, -0.20729161798954, 0.2107612490654, -0.21417234838009, 0.21752107143402, -0.22080361843109, 0.22401624917984, -0.22715525329113, 0.23021700978279, -0.23319797217846, 0.23609462380409, -0.2389035820961, 0.2416215389967, -0.24424524605274, 0.24677158892155, -0.24919754266739, 0.25152018666267, -0.25373673439026, 0.25584453344345, -0.25784096121788, 0.25972360372543, -0.26149019598961, 0.26313856244087, -0.26466664671898, 0.26607263088226, -0.26735472679138, 0.26851138472557, -0.26954114437103, 0.27044275403023, -0.27121511101723, 0.27185720205307, -0.2723682820797, 0.27274769544601, -0.27299493551254, 0.2731097638607, -0.27309197187424, 0.27294158935547, -0.27265882492065, 0.27224400639534, -0.27169767022133, 0.27102047204971, -0.27021327614784, 0.26927703619003, -0.26821294426918, 0.26702231168747, -0.2657065987587, 0.26426741480827, -0.26270654797554, 0.26102587580681, -0.25922748446465, 0.25731354951859, -0.2552864253521, 0.25314852595329, -0.25090250372887, 0.24855099618435, -0.24609684944153, 0.24354302883148, -0.24089252948761, 0.23814854025841, -0.23531427979469, 0.23239310085773, -0.22938840091228, 0.22630368173122, -0.22314251959324, 0.21990855038166, -0.21660548448563, 0.2132370620966, -0.209807112813, 0.20631946623325, -0.20277801156044, 0.19918666779995, -0.19554935395718, 0.19187006354332, -0.1881527453661, 0.18440136313438, -0.18061989545822, 0.17681230604649, -0.17298255860806, 0.16913455724716, -0.1652722209692, 0.16139942407608, -0.15751999616623, 0.15363773703575, 10246.969726562, 427.0, 99.0, -0.1535761654377, 0.15732407569885, -0.16107171773911, 0.16481567919254, -0.16855248808861, 0.17227859795094, -0.17599046230316, 0.17968451976776, -0.18335711956024, 0.18700465559959, -0.19062346220016, 0.19420988857746, -0.19776026904583, 0.20127093791962, -0.20473822951317, 0.20815850794315, -0.2115281522274, 0.21484354138374, -0.21810111403465, 0.2212973088026, -0.2244286686182, 0.22749169170856, -0.23048301041126, 0.23339925706387, -0.23623715341091, 0.23899349570274, -0.24166512489319, 0.2442489862442, -0.24674209952354, 0.24914157390594, -0.25144457817078, 0.25364845991135, -0.25575062632561, 0.25774851441383, -0.25963979959488, 0.26142221689224, -0.26309359073639, 0.26465192437172, -0.26609528064728, 0.26742196083069, -0.26863026618958, 0.26971870660782, -0.27068594098091, 0.27153074741364, -0.27225205302238, 0.27284890413284, -0.27332052588463, 0.27366629242897, -0.27388569712639, 0.27397841215134, -0.27394425868988, 0.27378317713737, -0.27349528670311, 0.27308088541031, -0.27254036068916, 0.27187430858612, -0.27108344435692, 0.27016860246658, -0.2691308259964, 0.26797130703926, -0.26669129729271, 0.26529228687286, -0.26377585530281, 0.26214373111725, -0.26039776206017, 0.25853994488716, -0.25657239556313, 0.25449737906456, -0.25231721997261, 0.25003445148468, -0.24765163660049, 0.24517150223255, -0.24259684979916, 0.23993058502674, -0.23717570304871, 0.23433531820774, -0.23141260445118, 0.22841082513332, -0.22533331811428, 0.2221834808588, -0.21896478533745, 0.21568076312542, -0.2123349905014, 0.20893108844757, -0.20547273755074, 0.20196363329887, -0.19840753078461, 0.19480815529823, -0.1911692917347, 0.1874947398901, -0.18378829956055, 0.18005372583866, -0.17629484832287, 0.17251542210579, -0.16871921718121, 0.16490995883942, -0.16109135746956, 0.15726709365845, -0.15344080328941, 10547.229492188, 439.0, 103.0, -0.15246915817261, 0.15612791478634, -0.15978562831879, 0.16343913972378, -0.16708521544933, 0.17072063684464, -0.17434211075306, 0.17794634401798, -0.18153002858162, 0.18508982658386, -0.18862241506577, 0.1921244263649, -0.19559253752232, 0.19902339577675, -0.20241366326809, 0.20576004683971, -0.20905920863152, 0.21230790019035, -0.21550285816193, 0.21864087879658, -0.22171877324581, 0.22473341226578, -0.22768171131611, 0.23056061565876, -0.23336717486382, 0.2360984236002, -0.23875154554844, 0.24132373929024, -0.24381229281425, 0.24621456861496, -0.24852801859379, 0.25075018405914, -0.25287866592407, 0.25491118431091, -0.25684556365013, 0.25867971777916, -0.2604116499424, 0.26203948259354, -0.26356145739555, 0.26497587561607, -0.26628124713898, 0.26747611165047, -0.26855918765068, 0.2695292532444, -0.27038529515266, 0.27112632989883, -0.27175155282021, 0.27226030826569, -0.27265200018883, 0.27292621135712, -0.27308267354965, 0.27312117815018, -0.27304172515869, 0.27284437417984, -0.2725293636322, 0.27209705114365, -0.27154791355133, 0.2708825469017, -0.27010175585747, 0.26920631527901, -0.26819729804993, 0.26707574725151, -0.26584294438362, 0.26450023055077, -0.26304909586906, 0.2614911198616, -0.25982800126076, 0.25806155800819, -0.25619366765022, 0.25422641634941, -0.25216192007065, 0.25000235438347, -0.24775007367134, 0.24540749192238, -0.24297706782818, 0.24046140909195, -0.23786316812038, 0.23518507182598, -0.23242993652821, 0.22960060834885, -0.22670005261898, 0.22373121976852, -0.22069719433784, 0.21760104596615, -0.21444591879845, 0.21123500168324, -0.20797149837017, 0.20465864241123, -0.20129971206188, 0.19789801537991, -0.19445683062077, 0.19097948074341, -0.1874693185091, 0.18392963707447, -0.18036377429962, 0.1767750531435, -0.17316676676273, 0.16954220831394, -0.16590465605259, 0.16225734353065, -0.15860348939896, 0.15494628250599, -0.1512888520956, 10856.286132812, 452.0, 106.0, 0.15260988473892, -0.15613396465778, 0.1596589833498, -0.16318209469318, 0.16670043766499, -0.17021106183529, 0.17371106147766, -0.1771974414587, 0.18066720664501, -0.18411736190319, 0.18754483759403, -0.19094662368298, 0.19431965053082, -0.19766086339951, 0.200967207551, -0.20423562824726, 0.2074630856514, -0.21064655482769, 0.21378301084042, -0.21686945855618, 0.21990293264389, -0.22288049757481, 0.22579924762249, -0.22865632176399, 0.23144887387753, -0.23417413234711, 0.23682937026024, -0.23941190540791, 0.24191911518574, -0.24434846639633, 0.24669744074345, -0.24896360933781, 0.25114464759827, -0.253238260746, 0.25524228811264, -0.25715455412865, 0.25897309184074, -0.26069593429565, 0.26232123374939, -0.26384726166725, 0.26527234911919, -0.26659497618675, 0.26781362295151, -0.26892703771591, 0.26993390917778, -0.27083316445351, 0.27162373065948, -0.27230477333069, 0.27287542819977, -0.27333506941795, 0.27368313074112, -0.27391916513443, 0.27404284477234, -0.27405399084091, 0.27395248413086, -0.2737383544445, 0.2734118103981, -0.27297309041023, 0.27242258191109, -0.27176082134247, 0.27098840475082, -0.27010613679886, 0.26911482214928, -0.26801544427872, 0.26680913567543, -0.26549708843231, 0.26408061385155, -0.26256111264229, 0.2609401345253, -0.25921934843063, 0.25740042328835, -0.25548526644707, 0.25347575545311, -0.25137394666672, 0.24918195605278, -0.24690198898315, 0.24453635513783, -0.2420873939991, 0.23955757915974, -0.23694944381714, 0.23426556587219, -0.23150862753391, 0.22868137061596, -0.22578655183315, 0.22282703220844, -0.2198057025671, 0.21672551333904, -0.21358942985535, 0.21040052175522, -0.20716179907322, 0.2038763910532, -0.20054738223553, 0.19717793166637, -0.19377118349075, 0.190330311656, -0.18685849010944, 0.18335890769958, -0.1798347234726, 0.17628912627697, -0.17272529006004, 0.16914634406567, -0.16555546224117, 0.16195571422577, -0.15835021436214, 0.15474203228951, -0.15113416314125, 11174.400390625, 465.0, 109.0, -0.15296602249146, 0.15640679001808, -0.15984639525414, 0.16328223049641, -0.16671159863472, 0.17013181746006, -0.17354016005993, 0.17693389952183, -0.18031027913094, 0.18366651237011, -0.18699984252453, 0.19030749797821, -0.19358667731285, 0.19683460891247, -0.20004852116108, 0.2032256424427, -0.20636320114136, 0.2094584852457, -0.21250875294209, 0.21551132202148, -0.21846351027489, 0.22136268019676, -0.22420620918274, 0.22699153423309, -0.22971612215042, 0.2323774844408, -0.2349731773138, 0.23750080168247, -0.2399580180645, 0.24234256148338, -0.24465216696262, 0.24688470363617, -0.24903807044029, 0.25111022591591, -0.25309920310974, 0.2550031542778, -0.2568202316761, 0.25854870676994, -0.26018694043159, 0.26173338294029, -0.26318651437759, 0.26454496383667, -0.26580742001534, 0.26697266101837, -0.26803958415985, 0.26900714635849, -0.26987442374229, 0.27064055204391, -0.27130481600761, 0.27186658978462, -0.27232533693314, 0.272680580616, -0.27293199300766, 0.27307936549187, -0.27312251925468, 0.27306148409843, -0.27289628982544, 0.27262708544731, -0.2722541987896, 0.27177795767784, -0.27119889855385, 0.2705175280571, -0.26973453164101, 0.26885071396828, -0.26786693930626, 0.26678416132927, -0.26560345292091, 0.26432591676712, -0.26295286417007, 0.26148560643196, -0.25992554426193, 0.25827422738075, -0.25653320550919, 0.25470414757729, -0.2527888417244, 0.25078910589218, -0.24870683252811, 0.24654398858547, -0.24430264532566, 0.24198488891125, -0.23959289491177, 0.2371288985014, -0.23459519445896, 0.23199413716793, -0.22932809591293, 0.22659951448441, -0.22381091117859, 0.22096478939056, -0.21806372702122, 0.2151103168726, -0.21210721135139, 0.20905703306198, -0.20596250891685, 0.20282632112503, -0.19965118169785, 0.19643986225128, -0.19319507479668, 0.18991959095001, -0.18661616742611, 0.18328756093979, -0.17993651330471, 0.17656579613686, -0.17317812144756, 0.16977623105049, -0.16636280715466, 0.16294057667255, -0.15951216220856, 0.15608023107052, -0.15264737606049, 11501.834960938, 480.0, 110.0, 0.15232710540295, -0.15576915442944, 0.1592101752758, -0.16264751553535, 0.1660785228014, -0.16950051486492, 0.17291077971458, -0.17630660533905, 0.1796852350235, -0.18304394185543, 0.1863799393177, -0.18969048559666, 0.19297279417515, -0.19622412323952, 0.19944170117378, -0.20262278616428, 0.20576463639736, -0.20886453986168, 0.2119197845459, -0.214927688241, 0.21788559854031, -0.22079090774059, 0.22364100813866, -0.22643335163593, 0.22916541993618, -0.23183473944664, 0.23443888127804, -0.23697547614574, 0.23944219946861, -0.24183677136898, 0.24415698647499, -0.24640069901943, 0.24856580793858, -0.25065031647682, 0.25265225768089, -0.25456973910332, 0.25640097260475, -0.25814425945282, 0.25979790091515, -0.26136037707329, 0.26283019781113, -0.26420593261719, 0.26548632979393, -0.26667010784149, 0.26775616407394, -0.26874348521233, 0.26963111758232, -0.27041819691658, 0.27110394835472, -0.27168780565262, 0.27216911315918, -0.27254748344421, 0.27282249927521, -0.2729939520359, 0.27306169271469, -0.27302560210228, 0.27288576960564, -0.27264231443405, 0.27229550480843, -0.27184566855431, 0.27129322290421, -0.27063876390457, 0.26988288760185, -0.26902630925179, 0.26806992292404, -0.26701459288597, 0.26586136221886, -0.26461136341095, 0.26326575875282, -0.26182588934898, 0.26029306650162, -0.25866878032684, 0.25695461034775, -0.25515213608742, 0.25326308608055, -0.25128921866417, 0.2492324411869, -0.24709463119507, 0.24487780034542, -0.24258403480053, 0.24021543562412, -0.2377741932869, 0.23526257276535, -0.23268285393715, 0.23003740608692, -0.22732862830162, 0.22455894947052, -0.22173090279102, 0.21884697675705, -0.21590974926949, 0.21292182803154, -0.20988583564758, 0.20680442452431, -0.20368027687073, 0.20051608979702, -0.19731457531452, 0.19407844543457, -0.19081045687199, 0.18751333653927, -0.18418982625008, 0.18084266781807, -0.17747461795807, 0.17408837378025, -0.17068667709827, 0.16727222502232, -0.16384771466255, 0.16041581332684, -0.15697914361954, 0.15354034304619, -0.15010200440884, 11838.864257812, 494.0, 113.0, 0.15247647464275, -0.15585567057133, 0.15923520922661, -0.16261257231236, 0.16598524153233, -0.16935066878796, 0.17270627617836, -0.17604947090149, 0.17937763035297, -0.18268816173077, 0.18597841262817, -0.18924574553967, 0.19248752295971, -0.19570110738277, 0.19888386130333, -0.20203314721584, 0.20514635741711, -0.20822085440159, 0.21125407516956, -0.21424341201782, 0.21718634665012, -0.22008034586906, 0.22292290627956, -0.22571155428886, 0.22844387590885, -0.23111747205257, 0.23373000323772, -0.23627914488316, 0.23876266181469, -0.24117833375931, 0.2435240149498, -0.24579758942127, 0.24799703061581, -0.25012037158012, 0.25216564536095, -0.25413107872009, 0.2560148537159, -0.25781524181366, 0.25953063368797, -0.26115947961807, 0.26270025968552, -0.26415160298347, 0.26551219820976, -0.26678076386452, 0.26795616745949, -0.26903736591339, 0.27002331614494, -0.27091321349144, 0.27170616388321, -0.27240151166916, 0.27299863100052, -0.27349698543549, 0.27389615774155, -0.27419576048851, 0.27439561486244, -0.27449551224709, 0.27449542284012, -0.27439540624619, 0.27419552206993, -0.2738960981369, 0.27349737286568, -0.27299979329109, 0.27240383625031, -0.27171015739441, 0.2709194123745, -0.27003234624863, 0.26904991269112, -0.26797297596931, 0.26680266857147, -0.26554003357887, 0.26418635249138, -0.26274287700653, 0.26121100783348, -0.2595921754837, 0.25788792967796, -0.25609984993935, 0.25422960519791, -0.25227898359299, 0.25024974346161, -0.24814382195473, 0.24596311151981, -0.24370962381363, 0.24138541519642, -0.23899258673191, 0.2365333288908, -0.23400983214378, 0.2314243465662, -0.2287791967392, 0.22607669234276, -0.223319247365, 0.22050924599171, -0.21764913201332, 0.21474139392376, -0.21178850531578, 0.20879299938679, -0.20575740933418, 0.20268426835537, -0.19957615435123, 0.1964356303215, -0.19326527416706, 0.19006767868996, -0.18684539198875, 0.18360102176666, -0.18033711612225, 0.17705623805523, -0.17376093566418, 0.17045374214649, -0.16713716089725, 0.16381369531155, -0.1604857891798, 0.15715590119362, -0.15382644534111, 0.15049977600574, 12185.76953125, 508.0, 117.0, 0.15217448771, -0.15539409220219, 0.15861305594444, -0.16182921826839, 0.16504040360451, -0.16824440658092, 0.17143903672695, -0.17462204396725, 0.17779120802879, -0.18094426393509, 0.18407896161079, -0.18719303607941, 0.19028420746326, -0.19335024058819, 0.19638882577419, -0.19939774274826, 0.20237471163273, -0.20531751215458, 0.20822389423847, -0.21109163761139, 0.21391855180264, -0.21670244634151, 0.21944117546082, -0.22213257849216, 0.22477458417416, -0.2273650765419, 0.22990202903748, -0.23238341510296, 0.23480726778507, -0.23717164993286, 0.23947463929653, -0.24171440303326, 0.24388910830021, -0.24599701166153, 0.24803636968136, -0.25000554323196, 0.2519029378891, -0.25372692942619, 0.25547608733177, -0.25714895129204, 0.25874412059784, -0.26026028394699, 0.26169618964195, -0.26305064558983, 0.26432251930237, -0.26551076769829, 0.26661440730095, -0.26763248443604, 0.26856416463852, -0.26940867304802, 0.27016532421112, -0.27083349227905, 0.27141258120537, -0.27190211415291, 0.2723017334938, -0.27261105179787, 0.27282986044884, -0.27295798063278, 0.27299529314041, -0.2729417681694, 0.27279749512672, -0.27256256341934, 0.27223721146584, -0.27182170748711, 0.27131640911102, -0.27072179317474, 0.2700383067131, -0.26926657557487, 0.26840725541115, -0.26746106147766, 0.26642882823944, -0.26531139016151, 0.2641097009182, -0.26282480359077, 0.26145774126053, -0.26000970602036, 0.25848186016083, -0.25687548518181, 0.25519195199013, -0.25343263149261, 0.25159898400307, -0.24969251453876, 0.2477148026228, -0.24566747248173, 0.24355217814445, -0.24137066304684, 0.23912468552589, -0.23681604862213, 0.2344466149807, -0.23201829195023, 0.22953301668167, -0.22699274122715, 0.22439950704575, -0.22175532579422, 0.21906228363514, -0.21632246673107, 0.21353800594807, -0.21071103215218, 0.20784373581409, -0.2049382776022, 0.20199686288834, -0.19902171194553, 0.19601503014565, -0.19297905266285, 0.18991602957249, -0.18682818114758, 0.18371775746346, -0.18058699369431, 0.17743812501431, -0.17427338659763, 0.17109498381615, -0.16790515184402, 0.1647060662508, -0.16149991750717, 0.15828885138035, -0.15507504343987, 0.15186059474945, 12542.83984375, 523.0, 120.0, -0.15276049077511, 0.15589684247971, -0.15903434157372, 0.16217099130154, -0.16530473530293, 0.16843356192112, -0.17155538499355, 0.17466811835766, -0.17776966094971, 0.18085791170597, -0.1839307397604, 0.18698601424694, -0.19002158939838, 0.19303531944752, -0.19602507352829, 0.19898870587349, -0.2019240707159, 0.20482902228832, -0.20770142972469, 0.21053919196129, -0.21334019303322, 0.21610231697559, -0.21882352232933, 0.22150173783302, -0.22413490712643, 0.22672103345394, -0.22925812005997, 0.23174422979355, -0.23417739570141, 0.23655574023724, -0.23887740075588, 0.24114055931568, -0.24334339797497, 0.2454842031002, -0.24756123125553, 0.24957287311554, -0.25151747465134, 0.253393471241, -0.2551993727684, 0.25693371891975, -0.25859504938126, 0.26018208265305, -0.26169347763062, 0.26312801241875, -0.26448452472687, 0.2657618522644, -0.2669589817524, 0.2680749297142, -0.26910874247551, 0.27005955576897, -0.27092662453651, 0.27170920372009, -0.27240663766861, 0.27301833033562, -0.27354380488396, 0.27398258447647, -0.27433434128761, 0.27459871768951, -0.27477553486824, 0.27486464381218, -0.27486595511436, 0.27477943897247, -0.27460518479347, 0.27434334158897, -0.27399411797523, 0.27355781197548, -0.27303475141525, 0.27242535352707, -0.27173018455505, 0.27094978094101, -0.27008476853371, 0.2691358923912, -0.26810389757156, 0.26698967814445, -0.26579412817955, 0.26451820135117, -0.26316297054291, 0.2617295384407, -0.26021909713745, 0.25863283872604, -0.25697207450867, 0.25523814558983, -0.25343245267868, 0.25155645608902, -0.24961169064045, 0.24759967625141, -0.24552205204964, 0.24338045716286, -0.24117662012577, 0.23891225457191, -0.23658917844296, 0.2342091947794, -0.23177418112755, 0.22928602993488, -0.22674667835236, 0.22415809333324, -0.22152227163315, 0.21884119510651, -0.21611694991589, 0.21335157752037, -0.21054716408253, 0.20770581066608, -0.20482961833477, 0.20192074775696, -0.19898129999638, 0.1960134357214, -0.1930193156004, 0.19000108540058, -0.18696087598801, 0.18390087783337, -0.18082322180271, 0.17773005366325, -0.17462350428104, 0.17150570452213, -0.16837877035141, 0.16524477303028, -0.16210582852364, 0.1589639633894, -0.15582123398781, 0.15267966687679, 12910.373046875, 537.0, 126.0, -0.15109317004681, 0.15409651398659, -0.1571000367403, 0.16010196506977, -0.16310057044029, 0.16609404981136, -0.16908061504364, 0.17205847799778, -0.17502580583096, 0.17798079550266, -0.18092159926891, 0.18384638428688, -0.18675331771374, 0.1896405518055, -0.19250623881817, 0.19534853100777, -0.19816561043262, 0.20095564424992, -0.20371678471565, 0.20644721388817, -0.20914514362812, 0.211808770895, -0.21443630754948, 0.21702598035336, -0.21957606077194, 0.22208479046822, -0.2245504707098, 0.22697141766548, -0.22934597730637, 0.2316724807024, -0.2339493483305, 0.23617498576641, -0.23834782838821, 0.24046637117863, -0.24252912402153, 0.24453464150429, -0.24648150801659, 0.24836833775043, -0.25019380450249, 0.25195661187172, -0.25365552306175, 0.25528928637505, -0.25685676932335, 0.25835680961609, -0.2597883939743, 0.26115047931671, -0.26244205236435, 0.26366224884987, -0.26481011509895, 0.26588490605354, -0.26688581705093, 0.26781210303307, -0.26866313815117, 0.2694383263588, -0.2701370716095, 0.27075892686844, -0.27130341529846, 0.27177014946938, -0.27215883135796, 0.27246916294098, -0.27270096540451, 0.27285405993462, -0.27292838692665, 0.27292385697365, -0.27284055948257, 0.27267849445343, -0.27243787050247, 0.27211883664131, -0.27172169089317, 0.27124670147896, -0.27069425582886, 0.27006477117538, -0.26935875415802, 0.26857671141624, -0.26771923899651, 0.26678696274757, -0.26578062772751, 0.26470097899437, -0.26354876160622, 0.26232489943504, -0.2610302567482, 0.25966581702232, -0.25823256373405, 0.25673153996468, -0.25516384840012, 0.25353062152863, -0.2518330514431, 0.25007236003876, -0.24824984371662, 0.24636676907539, -0.2444245070219, 0.24242441356182, -0.24036794900894, 0.23825652897358, -0.23609165847301, 0.23387484252453, -0.23160763084888, 0.22929160296917, -0.22692836821079, 0.22451953589916, -0.22206676006317, 0.21957170963287, -0.21703608334064, 0.21446157991886, -0.21184994280338, 0.20920290052891, -0.2065221965313, 0.20380961894989, -0.20106692612171, 0.19829592108727, -0.19549837708473, 0.19267608225346, -0.18983086943626, 0.18696449697018, -0.18407879769802, 0.18117554485798, -0.17825654149055, 0.17532359063625, -0.1723784506321, 0.16942290961742, -0.16645872592926, 0.16348764300346, -0.16051143407822, 0.15753178298473, -0.15455041825771, 0.15156903862953, 13288.67578125, 553.0, 130.0, -0.15221671760082, 0.15508465468884, -0.15795449912548, 0.16082470118999, -0.16369374096394, 0.16656002402306, -0.16942198574543, 0.17227804660797, -0.17512658238411, 0.17796596884727, -0.1807945817709, 0.18361078202724, -0.18641291558743, 0.18919931352139, -0.19196835160255, 0.19471833109856, -0.19744758307934, 0.20015446841717, -0.20283728837967, 0.20549438893795, -0.20812411606312, 0.21072478592396, -0.2132947742939, 0.21583242714405, -0.21833612024784, 0.2208042293787, -0.22323514521122, 0.22562725841999, -0.22797901928425, 0.23028884828091, -0.2325551956892, 0.23477657139301, -0.2369514554739, 0.2390783727169, -0.24115587770939, 0.24318253993988, -0.24515697360039, 0.24707779288292, -0.24894368648529, 0.25075331330299, -0.25250545144081, 0.25419881939888, -0.25583225488663, 0.25740453600883, -0.2589145898819, 0.26036131381989, -0.26174366474152, 0.26306062936783, -0.26431125402451, 0.26549461483955, -0.2666098177433, 0.26765608787537, -0.26863259077072, 0.26953861117363, -0.27037346363068, 0.27113649249077, -0.2718271613121, 0.27244487404823, -0.27298918366432, 0.27345961332321, -0.27385580539703, 0.27417746186256, -0.27442422509193, 0.27459594607353, -0.27469238638878, 0.27471348643303, -0.27465915679932, 0.27452936768532, -0.27432414889336, 0.27404364943504, -0.27368801832199, 0.27325740456581, -0.27275210618973, 0.27217239141464, -0.27151870727539, 0.27079138159752, -0.26999095082283, 0.26911789178848, -0.26817280054092, 0.26715630292892, -0.26606905460358, 0.26491180062294, -0.2636853158474, 0.26239040493965, -0.26102796196938, 0.25959888100624, -0.25810414552689, 0.25654473900795, -0.25492173433304, 0.25323623418808, -0.251489341259, 0.24968227744102, -0.24781621992588, 0.24589246511459, -0.24391227960587, 0.2418770045042, -0.23978799581528, 0.2376466691494, -0.23545445501804, 0.23321278393269, -0.23092319071293, 0.22858716547489, -0.22620625793934, 0.22378204762936, -0.22131611406803, 0.21881009638309, -0.21626561880112, 0.21368432044983, -0.21106790006161, 0.20841802656651, -0.20573642849922, 0.20302478969097, -0.20028483867645, 0.19751833379269, -0.19472698867321, 0.19191257655621, -0.18907684087753, 0.18622152507305, -0.18334838747978, 0.18045918643475, -0.17755569517612, 0.17463962733746, -0.17171274125576, 0.1687767803669, -0.16583347320557, 0.1628845334053, -0.15993164479733, 0.15697653591633, -0.15402086079121, 0.15106628835201, 13678.063476562, 570.0, 131.0, 0.15012240409851, -0.1530729085207, 0.15602512657642, -0.15897741913795, 0.16192811727524, -0.16487553715706, 0.16781798005104, -0.17075376212597, 0.17368112504482, -0.17659837007523, 0.17950373888016, -0.18239551782608, 0.18527193367481, -0.18813122808933, 0.1909716874361, -0.19379150867462, 0.19658897817135, -0.19936233758926, 0.20210984349251, -0.20482975244522, 0.20752035081387, -0.21017989516258, 0.21280670166016, -0.21539907157421, 0.21795532107353, -0.22047378122807, 0.22295281291008, -0.22539079189301, 0.22778612375259, -0.23013719916344, 0.23244248330593, -0.23470044136047, 0.23690955340862, -0.23906835913658, 0.24117541313171, -0.24322926998138, 0.24522858858109, -0.24717199802399, 0.24905817210674, -0.25088587403297, 0.25265383720398, -0.2543608546257, 0.25600579380989, -0.2575875222683, 0.25910499691963, -0.26055714488029, 0.26194298267365, -0.26326158642769, 0.26451206207275, -0.26569357514381, 0.26680529117584, -0.26784652471542, 0.26881650090218, -0.26971462368965, 0.27054026722908, -0.27129289507866, 0.27197203040123, -0.27257719635963, 0.273108035326, -0.27356418967247, 0.27394539117813, -0.27425143122673, 0.27448210120201, -0.27463731169701, 0.27471694350243, -0.27472105622292, 0.27464964985847, -0.27450284361839, 0.27428075671196, -0.27398362755775, 0.27361172437668, -0.27316531538963, 0.27264475822449, -0.2720505297184, 0.2713830769062, -0.27064290642738, 0.26983058452606, -0.26894673705101, 0.26799201965332, -0.26696720719337, 0.26587301492691, -0.26471027731895, 0.26347985863686, -0.26218265295029, 0.26081961393356, -0.25939172506332, 0.25790005922318, -0.2563456594944, 0.25472965836525, -0.2530532181263, 0.25131750106812, -0.24952377378941, 0.24767330288887, -0.24576736986637, 0.24380731582642, -0.24179451167583, 0.23973034322262, -0.23761622607708, 0.23545363545418, -0.23324401676655, 0.23098890483379, -0.22868978977203, 0.22634823620319, -0.22396579384804, 0.22154405713081, -0.21908462047577, 0.21658909320831, -0.21405909955502, 0.21149629354477, -0.20890231430531, 0.20627881586552, -0.20362746715546, 0.20094993710518, -0.1982479095459, 0.19552305340767, -0.19277705252171, 0.19001159071922, -0.18722832202911, 0.18442894518375, -0.18161511421204, 0.17878849804401, -0.17595073580742, 0.17310348153114, -0.17024835944176, 0.16738699376583, -0.16452100872993, 0.16165196895599, -0.15878145396709, 0.15591104328632, -0.15304225683212, 0.15017661452293, 14078.861328125, 586.0, 136.0, 0.15030515193939, -0.15307457745075, 0.15584447979927, -0.15861351788044, 0.16138029098511, -0.1641434431076, 0.16690155863762, -0.169653236866, 0.17239706218243, -0.17513161897659, 0.17785547673702, -0.18056720495224, 0.18326537311077, -0.18594852089882, 0.18861523270607, -0.19126403331757, 0.19389352202415, -0.19650223851204, 0.19908873736858, -0.20165160298347, 0.20418938994408, -0.2067007124424, 0.20918411016464, -0.21163821220398, 0.21406161785126, -0.21645292639732, 0.21881078183651, -0.22113382816315, 0.22342072427273, -0.22567011415958, 0.22788071632385, -0.23005123436451, 0.23218038678169, -0.2342669069767, 0.23630958795547, -0.23830719292164, 0.24025855958462, -0.24216249585152, 0.24401786923409, -0.24582357704639, 0.24757853150368, -0.24928167462349, 0.25093194842339, -0.25252839922905, 0.25407004356384, -0.25555592775345, 0.2569851577282, -0.25835686922073, 0.25967019796371, -0.26092436909676, 0.26211860775948, -0.26325216889381, 0.26432436704636, -0.26533451676369, 0.26628202199936, -0.26716631650925, 0.2679868042469, -0.26874303817749, 0.26943448185921, -0.27006077766418, 0.27062150835991, -0.27111631631851, 0.27154493331909, -0.27190706133842, 0.27220249176025, -0.27243104577065, 0.27259257435799, -0.27268698811531, 0.27271422743797, -0.27267429232597, 0.27256721258163, -0.2723930478096, 0.27215191721916, -0.27184394001961, 0.27146938443184, -0.27102842926979, 0.27052134275436, -0.26994851231575, 0.26931023597717, -0.26860693097115, 0.2678390443325, -0.26700705289841, 0.26611146330833, -0.26515287160873, 0.26413181424141, -0.26304897665977, 0.2619049847126, -0.26070058345795, 0.25943648815155, -0.25811347365379, 0.2567323744297, -0.25529402494431, 0.25379928946495, -0.25224909186363, 0.25064438581467, -0.24898611009121, 0.24727529287338, -0.24551296234131, 0.24370017647743, -0.24183800816536, 0.23992758989334, -0.23797003924847, 0.23596653342247, -0.23391824960709, 0.23182639479637, -0.22969220578671, 0.22751691937447, -0.22530181705952, 0.22304816544056, -0.22075727581978, 0.21843047440052, -0.21606907248497, 0.21367445588112, -0.21124795079231, 0.20879092812538, -0.20630480349064, 0.20379091799259, -0.20125071704388, 0.19868558645248, -0.19609692692757, 0.19348618388176, -0.19085474312305, 0.18820405006409, -0.18553552031517, 0.18285058438778, -0.18015067279339, 0.17743718624115, -0.17471155524254, 0.17197518050671, -0.16922950744629, 0.16647589206696, -0.16371576488018, 0.16095049679279, -0.15818147361279, 0.15541006624699, -0.1526376157999, 14491.404296875, 603.0, 141.0, -0.15050102770329, 0.15318119525909, -0.15586417913437, 0.15854877233505, -0.16123367846012, 0.1639176607132, -0.16659942269325, 0.16927766799927, -0.17195110023022, 0.17461839318275, -0.17727822065353, 0.17992925643921, -0.18257014453411, 0.18519955873489, -0.18781612813473, 0.1904185116291, -0.19300532341003, 0.19557522237301, -0.19812682271004, 0.20065878331661, -0.2031697332859, 0.20565831661224, -0.2081231623888, 0.21056291460991, -0.21297624707222, 0.21536180377007, -0.21771824359894, 0.22004425525665, -0.22233852744102, 0.22459974884987, -0.22682662308216, 0.22901786863804, -0.23117223381996, 0.23328846693039, -0.23536531627178, 0.23740158975124, -0.23939608037472, 0.24134761095047, -0.24325501918793, 0.24511717259884, -0.24693296849728, 0.24870130419731, -0.25042110681534, 0.25209134817123, -0.25371104478836, 0.25527915358543, -0.25679472088814, 0.2582568526268, -0.25966462492943, 0.26101720333099, -0.26231369376183, 0.26355332136154, -0.26473531126976, 0.2658588886261, -0.26692339777946, 0.26792815327644, -0.26887252926826, 0.26975587010384, -0.27057766914368, 0.27133738994598, -0.27203449606895, 0.2726686000824, -0.27323925495148, 0.27374610304832, -0.27418881654739, 0.27456703782082, -0.27488058805466, 0.27512919902802, -0.2753127515316, 0.27543103694916, -0.27548402547836, 0.27547159790993, -0.2753938138485, 0.27525064349174, -0.27504217624664, 0.27476853132248, -0.27442982792854, 0.27402627468109, -0.2735581099987, 0.27302560210228, -0.27242904901505, 0.27176880836487, -0.27104526758194, 0.27025884389877, -0.26941001415253, 0.26849928498268, -0.26752722263336, 0.26649436354637, -0.2654013633728, 0.26424884796143, -0.26303750276566, 0.26176810264587, -0.26044136285782, 0.25905808806419, -0.25761911273003, 0.25612530112267, -0.25457751750946, 0.25297671556473, -0.25132384896278, 0.24961987137794, -0.24786582589149, 0.24606274068356, -0.24421167373657, 0.24231372773647, -0.24037002027035, 0.23838169872761, -0.23634991049767, 0.23427586257458, -0.23216074705124, 0.23000581562519, -0.22781227529049, 0.22558143734932, -0.22331455349922, 0.22101292014122, -0.21867787837982, 0.21631073951721, -0.21391282975674, 0.21148552000523, -0.20903015136719, 0.20654812455177, -0.20404078066349, 0.20150953531265, -0.19895575940609, 0.19638086855412, -0.19378624856472, 0.1911732852459, -0.18854342401028, 0.18589802086353, -0.18323850631714, 0.18056628108025, -0.17788271605968, 0.17518922686577, -0.17248719930649, 0.16977800428867, -0.16706301271915, 0.16434359550476, -0.16162109375, 0.15889686346054, -0.15617223083973, 0.15344850718975, -0.15072701871395, 14916.034179688, 619.0, 148.0, -0.15041570365429, 0.15299685299397, -0.1555784791708, 0.15815944969654, -0.16073867678642, 0.16331502795219, -0.1658873707056, 0.16845455765724, -0.17101545631886, 0.17356890439987, -0.17611375451088, 0.17864885926247, -0.18117302656174, 0.18368510901928, -0.18618394434452, 0.18866835534573, -0.19113717973232, 0.19358925521374, -0.19602340459824, 0.19843848049641, -0.20083330571651, 0.20320674777031, -0.20555764436722, 0.20788486301899, -0.21018725633621, 0.21246369183064, -0.21471305191517, 0.21693424880505, -0.21912613511086, 0.22128766775131, -0.22341772913933, 0.22551529109478, -0.2275792658329, 0.22960862517357, -0.23160235583782, 0.23355942964554, -0.23547887802124, 0.23735970258713, -0.23920094966888, 0.24100169539452, -0.24276100099087, 0.24447798728943, -0.24615174531937, 0.24778142571449, -0.24936620891094, 0.25090527534485, -0.25239780545235, 0.25384306907654, -0.25524029135704, 0.25658875703812, -0.25788781046867, 0.25913673639297, -0.26033490896225, 0.26148170232773, -0.26257655024529, 0.26361888647079, -0.26460814476013, 0.26554387807846, -0.2664255797863, 0.26725280284882, -0.26802513003349, 0.26874214410782, -0.26940354704857, 0.2700090110302, -0.27055817842484, 0.2710508108139, -0.27148669958115, 0.27186560630798, -0.27218735218048, 0.27245184779167, -0.27265891432762, 0.27280852198601, -0.27290061116219, 0.27293515205383, -0.27291214466095, 0.2728316783905, -0.27269381284714, 0.27249863743782, -0.27224630117416, 0.2719369828701, -0.27157086133957, 0.27114817500114, -0.27066922187805, 0.27013424038887, -0.26954358816147, 0.26889756321907, -0.26819661259651, 0.26744112372398, -0.26663148403168, 0.2657682299614, -0.26485180854797, 0.26388275623322, -0.26286160945892, 0.26178896427155, -0.26066538691521, 0.259491533041, -0.2582680284977, 0.25699555873871, -0.25567480921745, 0.25430652499199, -0.25289145112038, 0.25143030285835, -0.24992392957211, 0.24837310612202, -0.24677866697311, 0.24514146149158, -0.24346235394478, 0.24174225330353, -0.23998203873634, 0.23818263411522, -0.23634497821331, 0.23447000980377, -0.2325587272644, 0.23061208426952, -0.22863109409809, 0.22661675512791, -0.22457008063793, 0.22249209880829, -0.22038386762142, 0.21824641525745, -0.21608081459999, 0.21388813853264, -0.21166943013668, 0.20942580699921, -0.20715832710266, 0.20486807823181, -0.20255619287491, 0.2002237290144, -0.19787180423737, 0.19550152122974, -0.19311398267746, 0.1907103061676, -0.18829156458378, 0.18585887551308, -0.18341335654259, 0.18095608055592, -0.17848815023899, 0.17601066827774, -0.17352470755577, 0.17103134095669, -0.16853165626526, 0.16602672636509, -0.16351759433746, 0.16100531816483, -0.15849094092846, 0.15597549080849, -0.15345999598503, 0.15094546973705, 15353.107421875, 640.0, 148.0, 0.15192626416683, -0.15446093678474, 0.15699546039104, -0.15952877700329, 0.16205982863903, -0.16458755731583, 0.16711089015007, -0.16962876915932, 0.17214009165764, -0.17464376986027, 0.17713871598244, -0.17962382733822, 0.18209800124168, -0.18456014990807, 0.18700917065144, -0.1894439458847, 0.19186335802078, -0.1942663192749, 0.19665172696114, -0.19901847839355, 0.20136545598507, -0.20369157195091, 0.20599575340748, -0.20827688276768, 0.21053390204906, -0.21276572346687, 0.2149712741375, -0.21714951097965, 0.21929936110973, -0.22141979634762, 0.22350978851318, -0.22556829452515, 0.22759433090687, -0.22958686947823, 0.23154494166374, -0.23346757888794, 0.2353538274765, -0.23720273375511, 0.23901335895061, -0.2407848238945, 0.24251621961594, -0.24420665204525, 0.24585528671741, -0.2474612891674, 0.24902382493019, -0.25054207444191, 0.25201532244682, -0.2534427344799, 0.25482362508774, -0.25615727901459, 0.25744295120239, -0.25868004560471, 0.25986787676811, -0.26100584864616, 0.26209333539009, -0.26312980055809, 0.26411464810371, -0.26504743099213, 0.2659275829792, -0.26675468683243, 0.26752829551697, -0.26824799180031, 0.26891338825226, -0.26952412724495, 0.27007988095284, -0.27058035135269, 0.27102527022362, -0.27141442894936, 0.27174752950668, -0.27202448248863, 0.27224504947662, -0.27240917086601, 0.27251672744751, -0.27256762981415, 0.27256187796593, -0.27249944210052, 0.27238035202026, -0.27220466732979, 0.27197244763374, -0.27168384194374, 0.27133893966675, -0.27093794941902, 0.27048107981682, -0.26996850967407, 0.26940053701401, -0.26877745985985, 0.2680995464325, -0.26736715435982, 0.26658067107201, -0.26574051380157, 0.26484706997871, -0.26390081644058, 0.26290220022202, -0.26185175776482, 0.26075002551079, -0.25959756970406, 0.25839495658875, -0.2571427822113, 0.25584170222282, -0.2544923722744, 0.25309547781944, -0.25165170431137, 0.25016179680824, -0.24862651526928, 0.24704658985138, -0.24542285501957, 0.24375610053539, -0.24204716086388, 0.24029690027237, -0.23850616812706, 0.23667585849762, -0.23480689525604, 0.23290018737316, -0.23095667362213, 0.22897729277611, -0.22696304321289, 0.22491489350796, -0.22283384203911, 0.2207209020853, -0.21857707202435, 0.21640342473984, -0.21420095860958, 0.21197076141834, -0.20971389114857, 0.20743139088154, -0.20512437820435, 0.20279391109943, -0.20044109225273, 0.19806702435017, -0.19567279517651, 0.19325952231884, -0.19082832336426, 0.18838028609753, -0.1859165430069, 0.18343821167946, -0.18094639480114, 0.17844220995903, -0.17592678964138, 0.17340122163296, -0.17086663842201, 0.16832412779331, -0.16577479243279, 0.16321974992752, -0.16066008806229, 0.15809687972069, -0.15553121268749, 0.15296415984631, -0.15039679408073, 15802.98828125, 658.0, 153.0, 0.15123662352562, -0.15370875597, 0.15618339180946, -0.15865954756737, 0.16113623976707, -0.16361245512962, 0.16608721017838, -0.16855949163437, 0.17102824151516, -0.17349246144295, 0.17595109343529, -0.17840310931206, 0.18084743618965, -0.18328303098679, 0.18570883572102, -0.18812376260757, 0.19052676856518, -0.19291676580906, 0.19529269635677, -0.19765347242355, 0.19999802112579, -0.20232526957989, 0.20463415980339, -0.20692360401154, 0.20919254422188, -0.21143990755081, 0.21366463601589, -0.21586568653584, 0.21804198622704, -0.22019252181053, 0.22231623530388, -0.22441209852695, 0.2264790982008, -0.22851622104645, 0.23052248358727, -0.23249687254429, 0.23443840444088, -0.23634614050388, 0.23821911215782, -0.2400563955307, 0.2418570369482, -0.24362014234066, 0.2453448176384, -0.2470301836729, 0.248675391078, -0.25027957558632, 0.25184190273285, -0.25336161255836, 0.25483787059784, -0.25626996159554, 0.25765708088875, -0.25899851322174, 0.26029360294342, -0.26154160499573, 0.26274192333221, -0.26389387249947, 0.26499685645103, -0.26605030894279, 0.2670536339283, -0.26800632476807, 0.26890784502029, -0.26975774765015, 0.27055552601814, -0.27130076289177, 0.27199307084084, -0.27263203263283, 0.27321735024452, -0.27374866604805, 0.27422568202019, -0.27464815974236, 0.27501586079597, -0.27532851696014, 0.2755860388279, -0.27578821778297, 0.27593493461609, -0.2760261297226, 0.2760616838932, -0.27604162693024, 0.27596592903137, -0.27583461999893, 0.27564775943756, -0.2754054069519, 0.27510771155357, -0.27475482225418, 0.27434685826302, -0.27388408780098, 0.27336671948433, -0.27279499173164, 0.27216923236847, -0.27148970961571, 0.27075684070587, -0.26997092366219, 0.26913243532181, -0.26824176311493, 0.26729935407639, -0.26630571484566, 0.26526135206223, -0.26416683197021, 0.26302266120911, -0.26182943582535, 0.26058781147003, -0.25929838418961, 0.25796183943748, -0.25657886266708, 0.25515013933182, -0.25367641448975, 0.25215843319893, -0.25059700012207, 0.24899286031723, -0.24734684824944, 0.24565979838371, -0.24393257498741, 0.24216602742672, -0.24036106467247, 0.23851858079433, -0.23663949966431, 0.2347247749567, -0.23277533054352, 0.23079216480255, -0.22877623140812, 0.22672854363918, -0.22465009987354, 0.22254191339016, -0.22040502727032, 0.21824046969414, -0.2160492837429, 0.21383254230022, -0.21159130334854, 0.2093266248703, -0.20703960955143, 0.20473131537437, -0.20240284502506, 0.2000552713871, -0.19768972694874, 0.19530726969242, -0.19290901720524, 0.19049605727196, -0.18806952238083, 0.1856304705143, -0.18318001925945, 0.18071927130222, -0.17824929952621, 0.17577122151852, -0.17328609526157, 0.17079500854015, -0.16829904913902, 0.16579926013947, -0.16329672932625, 0.16079248487949, -0.15828758478165, 0.15578307211399, -0.15327994525433, 0.15077923238277, 16266.05078125, 675.0, 161.0, -0.15125854313374, 0.15363113582134, -0.15600374341011, 0.15837550163269, -0.16074553132057, 0.16311296820641, -0.16547693312168, 0.16783654689789, -0.17019090056419, 0.17253912985325, -0.17488034069538, 0.1772136092186, -0.17953805625439, 0.18185278773308, -0.18415687978268, 0.18644943833351, -0.18872956931591, 0.19099634885788, -0.19324889779091, 0.19548632204533, -0.19770769774914, 0.19991214573383, -0.20209877192974, 0.20426669716835, -0.20641502737999, 0.20854288339615, -0.21064940094948, 0.21273370087147, -0.21479493379593, 0.21683223545551, -0.21884475648403, 0.22083167731762, -0.22279216349125, 0.22472538053989, -0.22663052380085, 0.22850678861141, -0.2303534001112, 0.23216956853867, -0.23395451903343, 0.23570750653744, -0.23742777109146, 0.23911461234093, -0.24076728522778, 0.24238510429859, -0.2439673691988, 0.24551340937614, -0.24702256917953, 0.24849420785904, -0.24992768466473, 0.25132238864899, -0.25267776846886, 0.2539931833744, -0.25526809692383, 0.25650197267532, -0.25769430398941, 0.25884455442429, -0.25995224714279, 0.26101690530777, -0.26203811168671, 0.26301538944244, -0.26394838094711, 0.2648366689682, -0.26567986607552, 0.26647767424583, -0.26722970604897, 0.26793572306633, -0.26859536767006, 0.26920840144157, -0.26977461576462, 0.27029374241829, -0.27076560258865, 0.27119001746178, -0.27156683802605, 0.27189588546753, -0.27217710018158, 0.27241036295891, -0.27259564399719, 0.27273282408714, -0.27282193303108, 0.27286294102669, -0.2728559076786, 0.27280083298683, -0.27269777655602, 0.27254685759544, -0.27234813570976, 0.27210178971291, -0.27180793881416, 0.27146673202515, -0.27107840776443, 0.27064317464828, -0.27016124129295, 0.26963284611702, -0.26905831694603, 0.26843789219856, -0.26777192950249, 0.26706075668335, -0.2663047015667, 0.26550415158272, -0.26465952396393, 0.26377120614052, -0.262839615345, 0.26186522841454, -0.26084849238396, 0.25978988409042, -0.25868993997574, 0.25754913687706, -0.25636804103851, 0.2551471889019, -0.25388711690903, 0.25258845090866, -0.25125175714493, 0.24987767636776, -0.24846678972244, 0.24701978266239, -0.24553726613522, 0.24401992559433, -0.24246843159199, 0.2408834695816, -0.23926575481892, 0.2376159876585, -0.23593488335609, 0.2342231720686, -0.23248161375523, 0.23071095347404, -0.22891193628311, 0.22708535194397, -0.22523196041584, 0.2233525365591, -0.22144788503647, 0.21951881051064, -0.21756608784199, 0.21559053659439, -0.21359297633171, 0.21157421171665, -0.20953507721424, 0.20747637748718, -0.20539896190166, 0.20330363512039, -0.20119123160839, 0.19906258583069, -0.19691854715347, 0.19475993514061, -0.19258756935596, 0.19040231406689, -0.18820497393608, 0.18599638342857, -0.18377739191055, 0.18154880404472, -0.17931143939495, 0.17706613242626, -0.17481370270252, 0.17255495488644, -0.17029069364071, 0.16802172362804, -0.16574884951115, 0.16347286105156, -0.16119453310966, 0.15891465544701, -0.1566339880228, 0.1543533205986, -0.1520733833313, 16742.681640625, 697.0, 162.0, -0.15063072741032, 0.1529358625412, -0.15524119138718, 0.15754592418671, -0.15984928607941, 0.16215048730373, -0.16444870829582, 0.16674315929413, -0.16903302073479, 0.17131748795509, -0.17359572649002, 0.17586694657803, -0.17813029885292, 0.180384978652, -0.18263015151024, 0.18486496806145, -0.18708863854408, 0.1893002986908, -0.19149912893772, 0.19368430972099, -0.19585499167442, 0.19801037013531, -0.20014961063862, 0.20227189362049, -0.2043763846159, 0.20646226406097, -0.20852874219418, 0.21057498455048, -0.21260020136833, 0.21460358798504, -0.21658433973789, 0.21854166686535, -0.22047480940819, 0.2223829627037, -0.22426538169384, 0.22612127661705, -0.22794991731644, 0.22975055873394, -0.2315224558115, 0.23326487839222, -0.23497712612152, 0.23665846884251, -0.23830822110176, 0.23992571234703, -0.2415102571249, 0.24306118488312, -0.24457785487175, 0.24605964124203, -0.24750590324402, 0.24891604483128, -0.25028946995735, 0.25162556767464, -0.25292378664017, 0.25418359041214, -0.25540441274643, 0.25658577680588, -0.25772711634636, 0.25882795453072, -0.25988787412643, 0.26090633869171, -0.26188293099403, 0.26281726360321, -0.26370888948441, 0.26455742120743, -0.26536253094673, 0.2661238014698, -0.26684093475342, 0.26751360297203, -0.26814153790474, 0.268724411726, -0.26926201581955, 0.26975405216217, -0.27020034193993, 0.27060067653656, -0.27095484733582, 0.2712627351284, -0.27152419090271, 0.2717390358448, -0.27190724015236, 0.27202865481377, -0.27210327982903, 0.27213102579117, -0.27211192250252, 0.27204591035843, -0.27193301916122, 0.27177330851555, -0.27156683802605, 0.27131363749504, -0.27101388573647, 0.27066764235497, -0.27027505636215, 0.26983630657196, -0.269351541996, 0.26882100105286, -0.26824486255646, 0.26762336492538, -0.26695680618286, 0.26624542474747, -0.2654894888401, 0.26468938589096, -0.26384538412094, 0.26295787096024, -0.26202720403671, 0.26105377078056, -0.2600379884243, 0.25898024439812, -0.25788098573685, 0.25674071907997, -0.25555986166, 0.25433892011642, -0.25307840108871, 0.25177881121635, -0.25044074654579, 0.24906469881535, -0.24765126407146, 0.24620100855827, -0.24471454322338, 0.2431924790144, -0.24163544178009, 0.24004405736923, -0.23841899633408, 0.23676089942455, -0.23507045209408, 0.23334835469723, -0.23159529268742, 0.22981198132038, -0.22799915075302, 0.22615750133991, -0.22428780794144, 0.22239080071449, -0.2204672396183, 0.21851789951324, -0.2165435552597, 0.21454498171806, -0.21252298355103, 0.21047833561897, -0.20841185748577, 0.20632436871529, -0.20421665906906, 0.20208956301212, -0.19994390010834, 0.19778050482273, -0.19560019671917, 0.19340381026268, -0.19119219481945, 0.18896618485451, -0.18672661483288, 0.18447434902191, -0.18221020698547, 0.17993502318859, -0.17764967679977, 0.17535498738289, -0.17305180430412, 0.1707409620285, -0.16842329502106, 0.16609965264797, -0.16377086937428, 0.16143776476383, -0.15910117328167, 0.15676189959049, -0.15442079305649, 0.15207862854004, 17233.28125, 717.0, 168.0, -0.15089026093483, 0.15311996638775, -0.15535239875317, 0.15758681297302, -0.15982249379158, 0.1620587259531, -0.16429473459721, 0.16652980446815, -0.16876317560673, 0.1709940880537, -0.17322178184986, 0.17544546723366, -0.17766438424587, 0.17987775802612, -0.18208479881287, 0.1842847019434, -0.18647669255733, 0.18865998089314, -0.19083374738693, 0.19299720227718, -0.19514954090118, 0.19728997349739, -0.19941768050194, 0.20153185725212, -0.20363169908524, 0.20571641623974, -0.20778518915176, 0.20983721315861, -0.21187169849873, 0.21388785541058, -0.21588486433029, 0.21786195039749, -0.21981832385063, 0.22175319492817, -0.22366578876972, 0.22555533051491, -0.22742106020451, 0.22926218807697, -0.23107798397541, 0.2328676879406, -0.23463056981564, 0.2363658696413, -0.23807288706303, 0.2397508919239, -0.24139918386936, 0.24301706254482, -0.24460382759571, 0.24615882337093, -0.24768136441708, 0.24917080998421, -0.25062650442123, 0.25204783678055, -0.25343415141106, 0.25478485226631, -0.25609940290451, 0.25737714767456, -0.25861755013466, 0.259820073843, -0.26098415255547, 0.26210930943489, -0.26319500803947, 0.26424077153206, -0.26524612307549, 0.2662105858326, -0.26713374257088, 0.26801517605782, -0.2688544690609, 0.26965126395226, -0.27040514349937, 0.27111575007439, -0.27178281545639, 0.27240595221519, -0.27298492193222, 0.27351942658424, -0.27400919795036, 0.274453997612, -0.27485358715057, 0.2752078473568, -0.27551651000977, 0.27577945590019, -0.27599653601646, 0.27616763114929, -0.27629265189171, 0.27637153863907, -0.27640417218208, 0.27639058232307, -0.27633067965508, 0.27622455358505, -0.27607214450836, 0.27587354183197, -0.27562883496284, 0.27533805370331, -0.27500131726265, 0.2746188044548, -0.27419057488441, 0.27371689677238, -0.27319785952568, 0.2726337313652, -0.27202472090721, 0.2713710963726, -0.27067309617996, 0.26993101835251, -0.26914516091347, 0.26831585168839, -0.26744347810745, 0.26652833819389, -0.26557084918022, 0.26457139849663, -0.26353040337563, 0.26244834065437, -0.26132559776306, 0.26016271114349, -0.25896012783051, 0.25771835446358, -0.25643792748451, 0.25511938333511, -0.25376325845718, 0.25237014889717, -0.25094059109688, 0.24947525560856, -0.24797470867634, 0.24643957614899, -0.2448705136776, 0.24326817691326, -0.24163322150707, 0.23996633291245, -0.23826821148396, 0.23653954267502, -0.23478104174137, 0.23299345374107, -0.23117749392986, 0.22933392226696, -0.22746348381042, 0.22556693851948, -0.2236450612545, 0.22169864177704, -0.21972845494747, 0.21773529052734, -0.21571996808052, 0.21368327736855, -0.21162603795528, 0.2095490694046, -0.20745319128036, 0.20533922314644, -0.20320801436901, 0.20106036961079, -0.19889713823795, 0.19671915471554, -0.19452726840973, 0.19232231378555, -0.19010512530804, 0.18787653744221, -0.18563741445541, 0.18338857591152, -0.18113087117672, 0.17886511981487, -0.17659217119217, 0.17431284487247, -0.17202799022198, 0.16973839700222, -0.16744491457939, 0.1651483476162, -0.16284950077534, 0.16054917871952, -0.15824818611145, 0.15594731271267, -0.15364734828472, 0.15134905278683, 17738.25390625, 739.0, 169.0, -0.15005207061768, 0.15236325562, -0.15467576682568, 0.15698882937431, -0.15930162370205, 0.1616133749485, -0.16392324864864, 0.16623045504093, -0.1685341745615, 0.17083357274532, -0.17312783002853, 0.17541612684727, -0.17769764363766, 0.17997151613235, -0.18223693966866, 0.18449306488037, -0.18673905730247, 0.18897406756878, -0.19119729101658, 0.19340787827969, -0.19560497999191, 0.19778777658939, -0.19995544850826, 0.20210713148117, -0.20424203574657, 0.20635932683945, -0.20845820009708, 0.2105378061533, -0.21259737014771, 0.21463607251644, -0.21665312349796, 0.21864773333073, -0.22061911225319, 0.22256650030613, -0.22448909282684, 0.22638615965843, -0.22825694084167, 0.23010069131851, -0.23191666603088, 0.23370416462421, -0.2354624569416, 0.23719084262848, -0.23888862133026, 0.24055513739586, -0.24218970537186, 0.24379166960716, -0.24536038935184, 0.24689522385597, -0.2483955770731, 0.24986085295677, -0.25129044055939, 0.25268375873566, -0.25404027104378, 0.25535941123962, -0.25664067268372, 0.25788354873657, -0.25908753275871, 0.26025211811066, -0.26137688755989, 0.26246136426926, -0.26350513100624, 0.26450777053833, -0.26546889543533, 0.26638814806938, -0.26726511120796, 0.26809948682785, -0.26889097690582, 0.26963922381401, -0.27034398913383, 0.27100497484207, -0.27162197232246, 0.27219471335411, -0.27272301912308, 0.27320671081543, -0.27364557981491, 0.27403950691223, -0.27438834309578, 0.27469202876091, -0.27495041489601, 0.27516344189644, -0.27533107995987, 0.27545329928398, -0.27553009986877, 0.27556145191193, -0.27554738521576, 0.27548798918724, -0.27538332343102, 0.27523344755173, -0.27503848075867, 0.27479854226112, -0.27451378107071, 0.27418440580368, -0.273810505867, 0.27339237928391, -0.27293017506599, 0.2724241912365, -0.27187463641167, 0.27128180861473, -0.27064597606659, 0.26996749639511, -0.26924666762352, 0.26848381757736, -0.26767936348915, 0.26683363318443, -0.2659470140934, 0.26501995325089, -0.26405289769173, 0.26304623484612, -0.26200044155121, 0.26091599464417, -0.25979337096214, 0.25863310694695, -0.25743567943573, 0.2562016248703, -0.25493150949478, 0.25362586975098, -0.25228527188301, 0.25091028213501, -0.24950152635574, 0.2480595856905, -0.24658507108688, 0.24507862329483, -0.24354086816311, 0.24197244644165, -0.24037402868271, 0.23874625563622, -0.23708979785442, 0.23540535569191, -0.23369361460209, 0.23195524513721, -0.23019097745419, 0.22840149700642, -0.22658753395081, 0.22474980354309, -0.22288903594017, 0.22100594639778, -0.21910127997398, 0.21717576682568, -0.21523016691208, 0.21326519548893, -0.21128162741661, 0.20928019285202, -0.20726166665554, 0.20522676408291, -0.20317627489567, 0.20111092925072, -0.19903150200844, 0.19693872332573, -0.19483336806297, 0.19271616637707, -0.1905878931284, 0.18844926357269, -0.1863010674715, 0.18414400517941, -0.18197885155678, 0.17980632185936, -0.17762716114521, 0.17544208467007, -0.17325183749199, 0.17105711996555, -0.16885866224766, 0.16665716469288, -0.16445332765579, 0.16224785149097, -0.16004142165184, 0.15783473849297, -0.1556284725666, 0.15342327952385, -0.15121982991695, 18258.025390625, 759.0, 178.0, -0.15159347653389, 0.15370059013367, -0.15580722689629, 0.1579127907753, -0.1600166708231, 0.16211827099323, -0.16421699523926, 0.1663122177124, -0.16840332746506, 0.17048971354961, -0.1725707501173, 0.17464582622051, -0.17671431601048, 0.17877560853958, -0.18082907795906, 0.18287409842014, -0.1849100291729, 0.18693627417088, -0.18895220756531, 0.19095718860626, -0.19295060634613, 0.19493183493614, -0.19690024852753, 0.19885525107384, -0.20079620182514, 0.20272250473499, -0.20463353395462, 0.20652867853642, -0.20840734243393, 0.21026892960072, -0.21211282908916, 0.21393844485283, -0.21574518084526, 0.21753247082233, -0.21929970383644, 0.22104632854462, -0.22277174890041, 0.22447541356087, -0.22615675628185, 0.22781521081924, -0.2294502556324, 0.23106130957603, -0.23264788091183, 0.23420940339565, -0.23574535548687, 0.23725524544716, -0.23873856663704, 0.24019479751587, -0.24162346124649, 0.24302406609058, -0.24439613521099, 0.24573922157288, -0.24705286324024, 0.24833659827709, -0.24958999454975, 0.25081264972687, -0.25200408697128, 0.25316396355629, -0.25429183244705, 0.2553873360157, -0.25645008683205, 0.25747972726822, -0.25847586989403, 0.25943818688393, -0.26036635041237, 0.26126006245613, -0.26211896538734, 0.26294276118279, -0.26373121142387, 0.26448401808739, -0.2652008831501, 0.26588159799576, -0.26652589440346, 0.26713359355927, -0.26770442724228, 0.26823821663857, -0.26873475313187, 0.26919388771057, -0.26961547136307, 0.2699992954731, -0.2703452706337, 0.27065327763557, -0.27092316746712, 0.27115485072136, -0.27134823799133, 0.27150329947472, -0.27161994576454, 0.27169811725616, -0.27173781394958, 0.27173900604248, -0.27170166373253, 0.27162581682205, -0.27151149511337, 0.27135869860649, -0.27116751670837, 0.27093797922134, -0.27067020535469, 0.27036419510841, -0.27002012729645, 0.26963812112808, -0.26921823620796, 0.26876065135002, -0.26826551556587, 0.26773300766945, -0.26716327667236, 0.26655653119087, -0.26591300964355, 0.26523286104202, -0.26451635360718, 0.26376369595528, -0.26297518610954, 0.26215106248856, -0.26129162311554, 0.2603971362114, -0.25946789979935, 0.25850424170494, -0.25750648975372, 0.25647497177124, -0.25541001558304, 0.25431203842163, -0.25318133831024, 0.25201833248138, -0.25082340836525, 0.24959696829319, -0.24833941459656, 0.24705119431019, -0.24573270976543, 0.24438440799713, -0.24300676584244, 0.24160021543503, -0.24016524851322, 0.23870232701302, -0.23721194267273, 0.23569460213184, -0.23415081202984, 0.2325810790062, -0.23098592460155, 0.22936590015888, -0.22772151231766, 0.22605332732201, -0.22436188161373, 0.22264775633812, -0.2209115177393, 0.21915371716022, -0.21737496554852, 0.21557582914829, -0.213756904006, 0.2119187861681, -0.21006210148335, 0.20818743109703, -0.20629541575909, 0.20438665151596, -0.20246179401875, 0.20052143931389, -0.19856624305248, 0.1965968310833, -0.19461385905743, 0.19261795282364, -0.19060978293419, 0.18858999013901, -0.18655923008919, 0.18451817333698, -0.18246746063232, 0.18040776252747, -0.1783397346735, 0.17626406252384, -0.17418140172958, 0.17209242284298, -0.16999781131744, 0.16789820790291, -0.16579431295395, 0.16368679702282, -0.16157631576061, 0.15946355462074, -0.15734918415546, 0.15523387491703, -0.1531182974577, 0.15100313723087, 18793.025390625, 785.0, 178.0, -0.15133839845657, 0.15340329706669, -0.15546946227551, 0.15753629803658, -0.1596032679081, 0.16166976094246, -0.1637352257967, 0.16579906642437, -0.16786068677902, 0.16991950571537, -0.17197489738464, 0.17402628064156, -0.1760730445385, 0.1781145632267, -0.18015024065971, 0.18217943608761, -0.18420153856277, 0.1862159371376, -0.188221976161, 0.19021905958652, -0.19220653176308, 0.19418378174305, -0.19615015387535, 0.19810502231121, -0.20004777610302, 0.20197774469852, -0.20389430224895, 0.2057968378067, -0.20768469572067, 0.20955723524094, -0.21141384541988, 0.21325388550758, -0.21507672965527, 0.216881737113, -0.21866829693317, 0.22043579816818, -0.22218360006809, 0.2239110916853, -0.22561766207218, 0.22730270028114, -0.22896562516689, 0.23060581088066, -0.232222661376, 0.23381561040878, -0.23538406193256, 0.23692743480206, -0.23844516277313, 0.23993667960167, -0.2414014339447, 0.24283884465694, -0.24424840509892, 0.24562956392765, -0.24698178470135, 0.24830454587936, -0.24959735572338, 0.25085970759392, -0.25209107995033, 0.25329101085663, -0.25445902347565, 0.25559467077255, -0.25669744610786, 0.25776696205139, -0.2588027715683, 0.25980442762375, -0.26077154278755, 0.26170369982719, -0.26260054111481, 0.2634616792202, -0.26428672671318, 0.26507538557053, -0.26582726836205, 0.26654204726219, -0.26721945405006, 0.26785919070244, -0.26846092939377, 0.2690244615078, -0.26954945921898, 0.27003574371338, -0.2704830467701, 0.2708911895752, -0.27125996351242, 0.27158918976784, -0.27187868952751, 0.27212831377983, -0.27233794331551, 0.27250742912292, -0.27263671159744, 0.27272567152977, -0.27277421951294, 0.27278235554695, -0.27274999022484, 0.27267715334892, -0.27256375551224, 0.27240988612175, -0.27221554517746, 0.27198076248169, -0.27170562744141, 0.27139016985893, -0.27103453874588, 0.27063882350922, -0.27020314335823, 0.26972764730453, -0.26921248435974, 0.26865786314011, -0.26806396245956, 0.26743102073669, -0.26675921678543, 0.266048848629, -0.26530012488365, 0.26451337337494, -0.26368889212608, 0.26282697916031, -0.26192793250084, 0.26099213957787, -0.26001995801926, 0.2590117752552, -0.2579679787159, 0.25688895583153, -0.25577518343925, 0.25462704896927, -0.25344505906105, 0.25222963094711, -0.25098133087158, 0.24970062077045, -0.24838800728321, 0.24704405665398, -0.24566930532455, 0.24426431953907, -0.24282966554165, 0.24136593937874, -0.23987376689911, 0.23835374414921, -0.23680651187897, 0.23523271083832, -0.23363301157951, 0.23200806975365, -0.23035857081413, 0.22868523001671, -0.22698873281479, 0.22526979446411, -0.22352916002274, 0.2217675447464, -0.21998573839664, 0.21818445622921, -0.2163645029068, 0.21452663838863, -0.21267165243626, 0.21080034971237, -0.20891353487968, 0.20701202750206, -0.2050966322422, 0.2031681984663, -0.20122753083706, 0.19927550852299, -0.19731295108795, 0.19534073770046, -0.19335970282555, 0.19137074053288, -0.18937470018864, 0.18737244606018, -0.18536488711834, 0.18335288763046, -0.18133732676506, 0.1793190985918, -0.17729909718037, 0.17527820169926, -0.17325732111931, 0.17123733460903, -0.16921915113926, 0.1672036498785, -0.16519173979759, 0.16318430006504, -0.16118222475052, 0.15918642282486, -0.15719777345657, 0.15521717071533, -0.15324547886848, 0.1512835919857, 19343.703125, 806.0, 217.0, 0.15134526789188, -0.1533832103014, 0.15542243421078, -0.15746232867241, 0.15950235724449, -0.16154192388058, 0.16358043253422, -0.16561730206013, 0.16765196621418, -0.16968378424644, 0.17171220481396, -0.17373660206795, 0.17575636506081, -0.17777092754841, 0.17977963387966, -0.18178191781044, 0.18377715349197, -0.18576474487782, 0.18774406611919, -0.1897145062685, 0.19167546927929, -0.19362632930279, 0.19556650519371, -0.19749537110329, 0.19941231608391, -0.20131674408913, 0.20320805907249, -0.20508566498756, 0.20694895088673, -0.20879732072353, 0.21063020825386, -0.21244701743126, 0.21424715220928, -0.2160300463438, 0.2177951335907, -0.21954184770584, 0.22126960754395, -0.22297787666321, 0.22466610372066, -0.22633372247219, 0.22798022627831, -0.22960506379604, 0.23120772838593, -0.23278768360615, 0.23434443771839, -0.23587749898434, 0.23738634586334, -0.23887053132057, 0.24032957851887, -0.24176299571991, 0.24317036569118, -0.24455121159554, 0.24590513110161, -0.24723167717457, 0.24853046238422, -0.2498010545969, 0.25104311108589, -0.25225618481636, 0.25343996286392, -0.25459408760071, 0.25571820139885, -0.2568119764328, 0.25787511467934, -0.25890728831291, 0.25990822911263, -0.26087763905525, 0.26181524991989, -0.26272085309029, 0.26359415054321, -0.26443499326706, 0.26524311304092, -0.26601833105087, 0.26676049828529, -0.26746940612793, 0.26814493536949, -0.26878693699837, 0.26939532160759, -0.26996994018555, 0.27051073312759, -0.27101761102676, 0.27149054408073, -0.27192947268486, 0.2723343372345, -0.27270519733429, 0.27304199337959, -0.27334478497505, 0.27361357212067, -0.2738484442234, 0.27404946088791, -0.27421668171883, 0.27435025572777, -0.27445024251938, 0.27451679110527, -0.27455008029938, 0.27455022931099, -0.27451744675636, 0.27445191144943, -0.27435383200645, 0.27422341704369, -0.27406096458435, 0.27386668324471, -0.27364087104797, 0.27338379621506, -0.27309572696686, 0.27277705073357, -0.27242806553841, 0.27204912900925, -0.27164056897163, 0.27120277285576, -0.27073612809181, 0.27024108171463, -0.26971799135208, 0.269167304039, -0.26858946681023, 0.26798495650291, -0.26735419034958, 0.26669770479202, -0.2660159766674, 0.2653095126152, -0.26457878947258, 0.26382440328598, -0.26304686069489, 0.26224672794342, -0.26142454147339, 0.26058089733124, -0.25971639156342, 0.25883159041405, -0.2579271197319, 0.25700360536575, -0.25606161355972, 0.25510182976723, -0.25412487983704, 0.25313141942024, -0.25212207436562, 0.25109753012657, -0.2500584423542, 0.24900552630424, -0.24793942272663, 0.24686083197594, -0.24577045440674, 0.24466899037361, -0.24355714023113, 0.24243561923504, -0.24130514264107, 0.24016642570496, -0.23902016878128, 0.2378671169281, -0.23670800030231, 0.23554353415966, -0.23437444865704, 0.2332014888525, -0.23202537000179, 0.23084683716297, -0.22966660559177, 0.22848543524742, -0.22730404138565, 0.22612315416336, -0.22494351863861, 0.22376583516598, -0.22259084880352, 0.22141928970814, -0.22025185823441, 0.21908928453922, -0.21793228387833, 0.21678155660629, -0.2156378030777, 0.21450172364712, -0.21337401866913, 0.21225537359715, -0.21114647388458, 0.21004799008369, -0.20896059274673, 0.2078849375248, -0.20682168006897, 0.20577147603035, -0.20473493635654, 0.20371271669865, -0.20270542800426, 0.20171366631985, -0.20073805749416, 0.19977916777134, -0.19883759319782, 0.19791388511658, -0.19700860977173, 0.19612231850624, -0.19525554776192, 0.19440880417824, -0.19358260929585, 0.19277745485306, -0.1919938325882, 0.19123220443726, -0.1904930472374, 0.18977679312229, -0.18908385932446, 0.18841467797756, -0.18776965141296, 0.18714916706085, -0.18655359745026, 0.18598328530788, -0.1854385882616, 0.18491983413696, -0.18442733585835, 0.18396137654781, -0.18352223932743, 0.1831101924181, -0.1827254742384, 0.1823683232069, -0.18203894793987, 0.18173755705357, -0.18146431446075, 0.18121939897537, -0.18100295960903, 0.18081510066986, -0.18065595626831, 0.18052561581135, -0.18042416870594, 0.18035165965557, 19910.517578125, 826.0, 197.0, 0.15001311898232, -0.15194387733936, 0.15387539565563, -0.15580728650093, 0.15773911774158, -0.15967048704624, 0.16160096228123, -0.16353014111519, 0.16545760631561, -0.16738295555115, 0.16930574178696, -0.17122559249401, 0.17314206063747, -0.17505475878716, 0.17696325480938, -0.17886716127396, 0.18076606094837, -0.18265953660011, 0.18454720079899, -0.18642865121365, 0.18830348551273, -0.19017131626606, 0.19203172624111, -0.19388434290886, 0.19572877883911, -0.19756464660168, 0.19939155876637, -0.20120914280415, 0.20301704108715, -0.20481486618519, 0.20660226047039, -0.20837885141373, 0.21014431118965, -0.21189826726913, 0.21364039182663, -0.21537032723427, 0.21708773076534, -0.21879230439663, 0.22048370540142, -0.22216160595417, 0.22382570803165, -0.22547571361065, 0.22711130976677, -0.22873219847679, 0.23033809661865, -0.23192873597145, 0.23350381851196, -0.23506310582161, 0.23660632967949, -0.23813323676586, 0.23964357376099, -0.24113710224628, 0.2426136136055, -0.24407286942005, 0.24551464617252, -0.24693875014782, 0.24834498763084, -0.24973315000534, 0.25110307335854, -0.2524545788765, 0.25378748774529, -0.25510165095329, 0.25639691948891, -0.25767314434052, 0.25893017649651, -0.26016795635223, 0.26138630509377, -0.26258513331413, 0.26376435160637, -0.26492384076118, 0.26606357097626, -0.2671834230423, 0.26828333735466, -0.26936331391335, 0.27042323350906, -0.27146309614182, 0.27248284220695, -0.27348250150681, 0.27446204423904, -0.27542144060135, 0.27636072039604, -0.27727988362312, 0.27817898988724, -0.27905800938606, 0.27991703152657, -0.28075611591339, 0.28157526254654, -0.28237456083298, 0.28315410017967, -0.28391396999359, 0.28465422987938, -0.28537499904633, 0.28607633709908, -0.28675842285156, 0.28742134571075, -0.28806525468826, 0.28869023919106, -0.28929650783539, 0.28988415002823, -0.29045337438583, 0.29100430011749, -0.29153713583946, 0.29205203056335, -0.29254919290543, 0.29302883148193, -0.29349109530449, 0.29393625259399, -0.29436445236206, 0.29477593302727, -0.29517093300819, 0.29554969072342, -0.29591238498688, 0.29625931382179, -0.29659068584442, 0.29690676927567, -0.29720783233643, 0.29749408364296, -0.29776585102081, 0.29802334308624, -0.29826685786247, 0.2984966635704, -0.29871305823326, 0.29891631007195, -0.29910671710968, 0.29928451776505, -0.29945009946823, 0.29960367083549, -0.29974555969238, 0.29987606406212, -0.29999548196793, 0.30010414123535, -0.3002023100853, 0.30029031634331, -0.30036848783493, 0.30043709278107, -0.30049642920494, 0.30054688453674, -0.30058869719505, 0.30062219500542, -0.30064770579338, 0.30066552758217, -0.30067598819733, 0.30067938566208, -0.30067601799965, 0.30066618323326, -0.30065023899078, 0.3006284236908, -0.30060112476349, 0.30056855082512, -0.30053105950356, 0.30048894882202, -0.30044248700142, 0.30039200186729, -0.30033773183823, 0.30028000473976, -0.3002190887928, 0.30015528202057, -0.30008882284164, 0.30002003908157, -0.29994913935661, 0.29987642168999, -0.2998021543026, 0.29972657561302, -0.29964995384216, 0.29957249760628, -0.29949447512627, 0.29941615462303, -0.29933768510818, 0.29925936460495, -0.29918140172958, 0.29910397529602, -0.29902732372284, 0.2989516556263, -0.29887712001801, 0.29880395531654, -0.29873234033585, 0.29866242408752, -0.29859441518784, 0.29852843284607, -0.29846465587616, 0.29840323328972, -0.29834431409836, 0.29828804731369, -0.29823452234268, 0.29818388819695, -0.29813623428345, 0.29809167981148, -0.29805034399033, 0.29801228642464, -0.29797759652138, 0.29794636368752, -0.29791861772537, 0.29789447784424, -0.29787397384644, 0.29785710573196, -0.29784396290779, 0.29783457517624, 20493.939453125, 852.0, 171.0, 0.1501577347517, -0.15218596160412, 0.15422140061855, -0.15626379847527, 0.15831288695335, -0.16036841273308, 0.1624301224947, -0.16449773311615, 0.16657099127769, -0.16864961385727, 0.17073334753513, -0.17282192409039, 0.17491506040096, -0.17701248824596, 0.17911392450333, -0.18121911585331, 0.18332774937153, -0.1854395866394, 0.18755434453487, -0.18967171013355, 0.19179144501686, -0.19391323626041, 0.19603683054447, -0.19816192984581, 0.20028826594353, -0.2024155408144, 0.20454347133636, -0.20667180418968, 0.20880022644997, -0.21092846989632, 0.21305625140667, -0.2151832729578, 0.21730928122997, -0.21943397819996, 0.22155709564686, -0.22367833554745, 0.22579742968082, -0.22791408002377, 0.23002803325653, -0.23213900625706, 0.23424670100212, -0.23635086417198, 0.23845119774342, -0.24054746329784, 0.24263934791088, -0.24472659826279, 0.2468089312315, -0.24888609349728, 0.25095781683922, -0.2530238032341, 0.25508382916451, -0.25713759660721, 0.25918486714363, -0.26122534275055, 0.26325881481171, -0.26528495550156, 0.26730358600616, -0.26931440830231, 0.27131715416908, -0.27331161499023, 0.27529749274254, -0.27727457880974, 0.27924260497093, -0.28120133280754, 0.28315052390099, -0.28508993983269, 0.28701934218407, -0.28893849253654, 0.29084715247154, -0.2927451133728, 0.29463210701942, -0.29650795459747, 0.29837238788605, -0.30022519826889, 0.30206617712975, -0.30389508605003, 0.3057117164135, -0.3075158894062, 0.30930733680725, -0.31108590960503, 0.31285136938095, -0.31460350751877, 0.31634214520454, -0.31806707382202, 0.31977808475494, -0.32147499918938, 0.32315760850906, -0.32482576370239, 0.32647925615311, -0.32811790704727, 0.32974153757095, -0.33134993910789, 0.33294299244881, -0.33452048897743, 0.33608224987984, -0.33762815594673, 0.33915796875954, -0.34067159891129, 0.34216886758804, -0.34364956617355, 0.34511360526085, -0.34656083583832, 0.3479910492897, -0.34940412640572, 0.35079994797707, -0.35217836499214, 0.35353919863701, -0.3548823595047, 0.3562076985836, -0.35751506686211, 0.35880434513092, -0.36007544398308, 0.36132818460464, -0.36256247758865, 0.36377817392349, -0.36497521400452, 0.36615341901779, -0.36731272935867, 0.36845302581787, -0.36957415938377, 0.37067607045174, -0.37175863981247, 0.37282177805901, -0.37386539578438, 0.37488934397697, -0.37589359283447, 0.37687805294991, -0.37784257531166, 0.37878710031509, -0.37971159815788, 0.38061591982841, -0.38150000572205, 0.38236376643181, -0.38320717215538, 0.38403010368347, -0.38483250141144, 0.38561430573463, -0.38637545704842, 0.38711586594582, -0.38783550262451, 0.38853427767754, -0.38921213150024, 0.38986903429031, -0.39050489664078, 0.39111971855164, -0.3917133808136, 0.39228588342667, -0.39283716678619, 0.39336720108986, -0.39387589693069, 0.39436328411102, -0.39482924342155, 0.39527380466461, -0.39569687843323, 0.3960984647274, -0.39647853374481, 0.39683702588081, -0.39717394113541, 0.39748924970627, -0.39778292179108, 0.39805492758751, -0.39830526709557, 0.3985338807106, -0.39874079823494, 0.39892596006393, -0.39908936619759, 0.39923101663589, -0.39935091137886, 0.39944899082184, -0.39952531456947, 0.39957982301712, 21094.458984375, 863.0, 160.0, -0.15112009644508, 0.15350343286991, -0.15590509772301, 0.15832485258579, -0.16076248884201, 0.16321778297424, -0.16569046676159, 0.16818033158779, -0.17068712413311, 0.17321056127548, -0.17575038969517, 0.17830635607243, -0.18087816238403, 0.18346552550793, -0.18606814742088, 0.18868574500084, -0.19131799042225, 0.19396460056305, -0.19662523269653, 0.19929955899715, -0.20198726654053, 0.20468799769878, -0.20740140974522, 0.21012715995312, -0.21286489069462, 0.21561421453953, -0.21837477385998, 0.2211462110281, -0.22392810881138, 0.22672009468079, -0.22952176630497, 0.23233273625374, -0.23515258729458, 0.23798090219498, -0.24081726372242, 0.24366126954556, -0.24651245772839, 0.2493704110384, -0.25223469734192, 0.25510483980179, -0.25798043608665, 0.26086097955704, -0.26374605298042, 0.26663514971733, -0.26952785253525, 0.27242365479469, -0.27532207965851, 0.27822268009186, -0.28112488985062, 0.28402832150459, -0.28693237900734, 0.28983664512634, -0.2927405834198, 0.29564371705055, -0.29854547977448, 0.30144542455673, -0.3043429851532, 0.30723768472672, -0.31012898683548, 0.31301635503769, -0.31589928269386, 0.31877726316452, -0.32164970040321, 0.32451614737511, -0.32737600803375, 0.33022877573967, -0.33307391405106, 0.33591088652611, -0.3387391269207, 0.34155812859535, -0.34436732530594, 0.34716618061066, -0.34995418787003, 0.3527307510376, -0.35549536347389, 0.35824745893478, -0.36098650097847, 0.36371195316315, -0.36642327904701, 0.36911994218826, -0.37180137634277, 0.37446704506874, -0.37711641192436, 0.37974897027016, -0.38236412405968, 0.38496139645576, -0.38754019141197, 0.39010006189346, -0.39264041185379, 0.39516070485115, -0.39766049385071, 0.40013918280602, -0.40259626507759, 0.40503123402596, -0.40744361281395, 0.40983283519745, -0.41219839453697, 0.41453981399536, -0.41685661673546, 0.41914826631546, -0.42141425609589, 0.4236541390419, -0.42586740851402, 0.42805361747742, -0.4302122592926, 0.43234285712242, -0.43444499373436, 0.43651813268661, -0.43856191635132, 0.44057580828667, -0.44255942106247, 0.44451230764389, -0.44643399119377, 0.44832411408424, -0.45018222928047, 0.45200791954994, -0.45380076766014, 0.45556038618088, -0.45728638768196, 0.4589783847332, -0.4606359899044, 0.4622588455677, -0.46384653449059, 0.46539878845215, -0.46691516041756, 0.46839538216591, -0.46983909606934, 0.47124594449997, -0.47261565923691, 0.47394788265228, -0.47524234652519, 0.47649875283241, -0.4777167737484, 0.47889617085457, -0.48003667593002, 0.48113799095154, -0.48219990730286, 0.48322215676308, -0.48420450091362, 0.48514673113823, -0.48604863882065, 0.4869099855423, -0.48773059248924, 0.48851025104523, -0.48924881219864, 0.48994606733322, -0.49060189723969, 0.4912161231041, -0.49178859591484, 0.49231922626495, -0.4928078353405, 0.49325436353683, -0.49365866184235, 0.49402064085007, -0.49434024095535, 0.49461737275124, -0.49485200643539, 0.49504402279854, -0.49519342184067, 0.49530017375946, 21712.572265625, 872.0, 151.0, 0.15178839862347, -0.15457354485989, 0.15738391876221, -0.16021922230721, 0.16307917237282, -0.16596341133118, 0.16887164115906, -0.17180351912975, 0.17475868761539, -0.17773677408695, 0.18073742091656, -0.18376025557518, 0.18680487573147, -0.18987086415291, 0.19295781850815, -0.19606532156467, 0.19919294118881, -0.20234021544456, 0.20550671219826, -0.20869193971157, 0.21189545094967, -0.21511675417423, 0.21835534274578, -0.22161072492599, 0.22488239407539, -0.22816981375217, 0.2314724624157, -0.23478980362415, 0.23812127113342, -0.24146631360054, 0.24482437968254, -0.24819488823414, 0.25157722830772, -0.25497084856033, 0.25837513804436, -0.26178947091103, 0.26521325111389, -0.26864582300186, 0.27208659052849, -0.275534927845, 0.27899014949799, -0.28245159983635, 0.28591868281364, -0.28939065337181, 0.2928669154644, -0.29634675383568, 0.2998294532299, -0.30331438779831, 0.30680084228516, -0.31028810143471, 0.31377544999123, -0.31726223230362, 0.32074767351151, -0.32423108816147, 0.32771173119545, -0.33118891716003, 0.33466187119484, -0.33812987804413, 0.34159219264984, -0.34504809975624, 0.34849682450294, -0.35193765163422, 0.35536980628967, -0.35879254341125, 0.3622051179409, -0.36560678482056, 0.36899676918983, -0.372374355793, 0.37573871016502, -0.37908917665482, 0.38242492079735, -0.38574519753456, 0.38904929161072, -0.39233639836311, 0.39560580253601, -0.39885669946671, 0.40208837389946, -0.40530008077621, 0.40849104523659, -0.41166052222252, 0.41480776667595, -0.41793206334114, 0.42103260755539, -0.4241087436676, 0.42715966701508, -0.43018469214439, 0.4331830739975, -0.43615409731865, 0.43909704685211, -0.44201120734215, 0.4448958337307, -0.44775027036667, 0.45057383179665, -0.45336577296257, 0.45612540841103, -0.45885211229324, 0.46154516935349, -0.46420392394066, 0.46682769060135, -0.46941587328911, 0.47196778655052, -0.4744827747345, 0.47696024179459, -0.47939956188202, 0.48180010914803, -0.48416128754616, 0.48648247122765, -0.48876309394836, 0.49100258946419, -0.49320039153099, 0.49535590410233, -0.49746859073639, 0.49953791499138, -0.50156337022781, 0.50354439020157, -0.50548052787781, 0.50737124681473, -0.50921601057053, 0.51101440191269, -0.5127660036087, 0.51447027921677, -0.51612681150436, 0.51773518323898, -0.51929491758347, 0.52080571651459, -0.52226710319519, 0.52367871999741, -0.52504020929337, 0.5263512134552, -0.5276113152504, 0.52882033586502, -0.52997785806656, 0.53108358383179, -0.53213721513748, 0.53313851356506, -0.53408718109131, 0.53498297929764, -0.53582566976547, 0.53661507368088, -0.53735095262527, 0.53803306818008, -0.53866130113602, 0.53923547267914, -0.53975540399551, 0.54022097587585, -0.54063206911087, 0.54098856449127, -0.54129034280777, 0.54153740406036, -0.54172962903976, 0.54186695814133 ];
    
    
    //8393 entries
    self.qdata2048sr48000 = [ 48000.0, 2048.0, 171.0, 174.60000610352, 7.0, 2.0, -0.23133328557014, 0.21097573637962, 179.71617126465, 7.0, 2.0, -0.19238638877869, 0.24919819831848, 184.98225402832, 8.0, 1.0, 0.26949661970139, 190.40264892578, 8.0, 2.0, 0.26950389146805, -0.15698993206024, 195.98187255859, 8.0, 2.0, 0.2507022023201, -0.20742332935333, 201.72457885742, 8.0, 2.0, 0.21759013831615, -0.24679611623287, 207.63555908203, 8.0, 2.0, 0.1762448400259, -0.26863649487495, 213.71974182129, 9.0, 2.0, -0.27022594213486, 0.17546465992928, 219.98220825195, 9.0, 2.0, -0.25276175141335, 0.22293682396412, 226.42819213867, 9.0, 2.0, -0.22054181993008, 0.25669831037521, 233.06303405762, 9.0, 3.0, -0.17963519692421, 0.27152863144875, -0.15976037085056, 239.8923034668, 10.0, 2.0, 0.26609501242638, -0.20981262624264, 246.92169189453, 10.0, 2.0, 0.2428071051836, -0.24838083982468, 254.15704345703, 10.0, 3.0, 0.20685675740242, -0.26924934983253, 0.15915946662426, 261.60440063477, 10.0, 3.0, 0.16441677510738, -0.2697856426239, 0.20925775170326, 269.27001953125, 11.0, 2.0, -0.25143048167229, 0.24803729355335, 277.16021728516, 11.0, 3.0, -0.21858011186123, 0.26908481121063, -0.17109394073486, 285.28164672852, 11.0, 3.0, -0.17741794884205, 0.26989263296127, -0.21936799585819, 293.64102172852, 12.0, 2.0, 0.25176194310188, -0.25456485152245, 302.24536132812, 12.0, 3.0, 0.21905995905399, -0.27106505632401, 0.19313810765743, 311.1018371582, 12.0, 3.0, 0.17796984314919, -0.2672965824604, 0.23665189743042, 320.21780395508, 13.0, 3.0, -0.24537554383278, 0.26421803236008, -0.17351169884205, 329.60092163086, 13.0, 3.0, -0.21024523675442, 0.27190348505974, -0.22134120762348, 339.25894165039, 13.0, 4.0, -0.16800603270531, 0.25974875688553, -0.25569954514503, 0.16112621128559, 349.20001220703, 14.0, 3.0, 0.23141568899155, -0.27136862277985, 0.21107351779938, 359.4323425293, 14.0, 4.0, 0.19244703650475, -0.26669067144394, 0.24923014640808, -0.15600544214249, 369.96450805664, 15.0, 3.0, -0.24402621388435, 0.26951977610588, -0.20647577941418, 380.80529785156, 15.0, 4.0, -0.20836853981018, 0.26950645446777, -0.24610503017902, 0.15698562562466, 391.96374511719, 15.0, 4.0, -0.16607871651649, 0.25070887804031, -0.26839339733124, 0.20741608738899, 403.44915771484, 16.0, 4.0, 0.21759742498398, -0.27041226625443, 0.24679017066956, -0.16380049288273, 415.27111816406, 16.0, 4.0, 0.17624840140343, -0.25329092144966, 0.26863494515419, -0.21321141719818, 427.43948364258, 17.0, 4.0, -0.22137823700905, 0.2702534198761, -0.25068414211273, 0.17554204165936, 439.96441650391, 17.0, 4.0, -0.18063186109066, 0.25280186533928, -0.27001976966858, 0.22299094498158, 452.85638427734, 18.0, 4.0, 0.2206010222435, -0.26902016997337, 0.25673466920853, -0.19129408895969, 466.12606811523, 18.0, 5.0, 0.17963927984238, -0.2493461817503, 0.27152851223946, -0.23519243299961, 0.15975497663021, 479.78460693359, 19.0, 4.0, -0.21568758785725, 0.26609927415848, -0.26348742842674, 0.20980507135391, 493.84338378906, 19.0, 5.0, -0.1740974932909, 0.24281552433968, -0.27196061611176, 0.24837410449982, -0.18369342386723, 508.31408691406, 20.0, 5.0, 0.20686329901218, -0.26059377193451, 0.26924768090248, -0.22949512302876, 0.1591531932354, 523.20880126953, 20.0, 5.0, 0.16442008316517, -0.23274640738964, 0.26978906989098, -0.26046967506409, 0.20924936234951, 538.5400390625, 21.0, 5.0, -0.19416144490242, 0.25147846341133, -0.27205327153206, 0.2480870038271, -0.18954965472221, 554.32043457031, 21.0, 6.0, -0.15081487596035, 0.21858663856983, -0.26344150304794, 0.26908305287361, -0.23380328714848, 0.17108716070652, 570.56329345703, 22.0, 6.0, 0.17752407491207, -0.23779986798763, 0.26992985606194, -0.26282244920731, 0.21944054961205, -0.15507878363132, 587.28204345703, 23.0, 5.0, -0.20039246976376, 0.25181671977043, -0.27206656336784, 0.25461262464523, -0.20572534203529, 604.49072265625, 23.0, 6.0, -0.15745067596436, 0.21913966536522, -0.26135018467903, 0.27110162377357, -0.24558791518211, 0.19323648512363, 622.20367431641, 24.0, 6.0, 0.17808532714844, -0.23405276238918, 0.2673399746418, -0.26820948719978, 0.23671700060368, -0.18251678347588, 640.43560791016, 25.0, 6.0, -0.19562004506588, 0.24538683891296, -0.27056911587715, 0.26421314477921, -0.22845138609409, 0.17350180447102, 659.20184326172, 25.0, 7.0, -0.15252502262592, 0.21025693416595, -0.25379884243011, 0.27190667390823, -0.25990453362465, 0.22132889926434, -0.16646829247475, 678.51788330078, 26.0, 7.0, 0.168009147048, -0.22200655937195, 0.25975432991982, -0.27195221185684, 0.25569397211075, -0.21539641916752, 0.1611192971468, 698.40002441406, 27.0, 7.0, -0.18154111504555, 0.23149636387825, -0.26398426294327, 0.27141058444977, -0.25218707323074, 0.21117210388184, -0.15795037150383, 718.86468505859, 28.0, 7.0, 0.19245356321335, -0.23862670361996, 0.26669606566429, -0.2704456448555, 0.249222189188, -0.20805765688419, 0.1559974104166, 739.92901611328, 29.0, 7.0, -0.20137380063534, 0.24403415620327, -0.26845213770866, 0.26951774954796, -0.24719694256783, 0.2064656317234, -0.15575444698334, 761.61059570312, 29.0, 8.0, -0.15861013531685, 0.20847855508327, -0.2480199187994, 0.26955422759056, -0.26882925629616, 0.24617767333984, -0.20635518431664, 0.15713973343372, 783.92749023438, 30.0, 8.0, 0.16608613729477, -0.21376526355743, 0.25072100758553, -0.270134806633, 0.26839008927345, -0.24599856138229, 0.20740282535553, -0.15973937511444, 806.89831542969, 31.0, 8.0, -0.17197848856449, 0.21760466694832, -0.25244817137718, 0.27041539549828, -0.2683472931385, 0.24678228795528, -0.2097674459219, 0.16379205882549, 830.54223632812, 32.0, 8.0, 0.17640461027622, -0.22017678618431, 0.25336727499962, -0.27048456668854, 0.26868760585785, -0.2484335154295, 0.21332275867462, -0.16919983923435, 854.87896728516, 33.0, 8.0, -0.17916204035282, 0.22139319777489, -0.25343051552773, 0.2702599465847, -0.26924028992653, 0.25067284703255, -0.21769364178181, 0.1755291223526, 879.92883300781, 34.0, 8.0, 0.18064327538013, -0.2215526252985, 0.25281628966331, -0.2698125243187, 0.2700175344944, -0.25352144241333, 0.22297509014606, -0.18299110233784, 905.71276855469, 35.0, 8.0, -0.18093781173229, 0.22072504460812, -0.25153848528862, 0.26908150315285, -0.27088898420334, 0.25680527091026, -0.22898733615875, 0.19143991172314, 932.25213623047, 36.0, 9.0, 0.17980466783047, -0.21873067319393, 0.24943032860756, -0.26786583662033, 0.27158424258232, -0.2601689696312, 0.23529545962811, -0.20038498938084, 0.15994109213352, 959.56921386719, 37.0, 9.0, -0.17763014137745, 0.21582512557507, -0.2466089874506, 0.26616907119751, -0.27204412221909, 0.26355400681496, -0.24190267920494, 0.20993742346764, -0.17162121832371, 987.68676757812, 38.0, 9.0, 0.17410762608051, -0.21174755692482, 0.24283041059971, -0.2637315094471, 0.27196365594864, -0.26658883690834, 0.2483619004488, -0.21958097815514, 0.18367958068848, 1016.6281738281, 39.0, 10.0, -0.16998672485352, 0.20701083540916, -0.23838213086128, 0.26066958904266, -0.27137237787247, 0.26931193470955, -0.25480914115906, 0.22961534559727, -0.19661463797092, 0.15935686230659, 1046.4176025391, 40.0, 10.0, 0.16462253034115, -0.20111520588398, 0.23286361992359, -0.25661325454712, 0.26985374093056, -0.27119097113609, 0.26054915785789, -0.2391682267189, 0.20940020680428, -0.17434397339821, 1077.080078125, 41.0, 11.0, -0.15843127667904, 0.1943341344595, -0.22640526294708, 0.25157210230827, -0.26733493804932, 0.27211672067642, -0.26548188924789, 0.24818755686283, -0.22206166386604, 0.1897304058075, -0.15424379706383, 1108.6408691406, 42.0, 11.0, 0.15105146169662, -0.18636448681355, 0.2187422066927, -0.24528819322586, 0.26352733373642, -0.27173259854317, 0.26915264129639, -0.25610503554344, 0.23392158746719, -0.20475661754608, 0.17129130661488, 1141.1265869141, 44.0, 11.0, 0.17752747237682, -0.21004927158356, 0.23780828714371, -0.25838226079941, 0.26993373036385, -0.27143976092339, 0.26281636953354, -0.24492004513741, 0.21942768990993, -0.18861491978168, 0.15506775677204, 1174.5640869141, 45.0, 11.0, -0.16794764995575, 0.20041172206402, -0.22915431857109, 0.25183656811714, -0.2665559053421, 0.27207088470459, -0.26794609427452, 0.25459790229797, -0.23323485255241, 0.20570354163647, -0.17426274716854, 1208.9814453125, 46.0, 12.0, 0.15769244730473, -0.18985189497471, 0.21929541230202, -0.24379840493202, 0.26143833994865, -0.27080851793289, 0.27117469906807, -0.26255390048027, 0.24570529162884, -0.22203584015369, 0.19343438744545, -0.16205759346485, 1244.4073486328, 48.0, 12.0, 0.17808786034584, -0.20800438523293, 0.23406048119068, -0.25434815883636, 0.26734480261803, -0.27207377552986, 0.26820579171181, -0.25608915090561, 0.23670542240143, -0.21155722439289, 0.18250349164009, -0.15156377851963, 1280.8712158203, 49.0, 12.0, -0.16558535397053, 0.19562244415283, -0.22284178435802, 0.24539209902287, -0.26168873906136, 0.27057129144669, -0.27141866087914, 0.2642086148262, -0.24951459467411, 0.22844123840332, -0.20250734686852, 0.17349065840244, 1318.4036865234, 50.0, 13.0, 0.15252228081226, -0.18230812251568, 0.21026083827019, -0.23462435603142, 0.25380417704582, -0.26651626825333, 0.27190768718719, -0.26963606476784, 0.2598984837532, -0.24340751767159, 0.2213176637888, -0.19511117041111, 0.16645675897598, 1357.0357666016, 52.0, 13.0, 0.16826428472996, -0.19649641215801, 0.22217510640621, -0.24374437332153, 0.25985544919968, -0.26948630809784, 0.27203226089478, -0.26735818386078, 0.25580707192421, -0.2381643652916, 0.21558253467083, -0.18947465717793, 0.16138836741447, 1396.8000488281, 53.0, 14.0, -0.15373340249062, 0.18178345263004, -0.20824821293354, 0.2316530495882, -0.25064000487328, 0.26408040523529, -0.27116969227791, 0.27149423956871, -0.26506447792053, 0.25231039524078, -0.23404085636139, 0.21137128770351, -0.18562693893909, 0.15823231637478, 1437.7293701172, 55.0, 14.0, -0.16588790714741, 0.19270201027393, -0.21744588017464, 0.23879277706146, -0.25555983185768, 0.26680132746696, -0.27188357710838, 0.27053439617157, -0.26286259293556, 0.24934604763985, -0.23078945279121, 0.20825676620007, -0.18298460543156, 0.15628516674042, 1479.8580322266, 57.0, 14.0, -0.1761140525341, 0.20159481465816, -0.22467631101608, 0.24417480826378, -0.25906264781952, 0.26854494214058, -0.27211901545525, 0.26961109042168, -0.26118734478951, 0.24733830988407, -0.22883853316307, 0.20668533444405, -0.18202248215675, 0.15605571866035, 1523.2211914062, 58.0, 15.0, 0.158926025033, -0.18455247581005, 0.20871412754059, -0.23027311265469, 0.24817633628845, -0.26152908802032, 0.26965823769569, -0.27215960621834, 0.26892545819283, -0.26015037298203, 0.2463144659996, -0.22814637422562, 0.20656897127628, -0.18263268470764, 0.15744242072105, 1567.8549804688, 60.0, 15.0, 0.16609899699688, -0.19077786803246, 0.21378645300865, -0.23408864438534, 0.25074049830437, -0.26295271515846, 0.27014338970184, -0.27197659015656, 0.26838371157646, -0.25956636667252, 0.24598023295403, -0.22830191254616, 0.20738120377064, -0.18418322503567, 0.1597246825695, 1613.7966308594, 62.0, 15.0, 0.17227308452129, -0.19593240320683, 0.21781206130981, -0.23697666823864, 0.25258266925812, -0.26393121480942, 0.27051231265068, -0.27203646302223, 0.26845228672028, -0.25994810461998, 0.24693794548512, -0.23003296554089, 0.21000097692013, -0.18771687150002, 0.16410794854164, 1661.0844726562, 63.0, 16.0, -0.15267685055733, 0.17639997601509, -0.19919666647911, 0.22017692029476, -0.23848906159401, 0.2533695101738, -0.26418814063072, 0.27048566937447, -0.27200078964233, 0.26868498325348, -0.26070401072502, 0.24842619895935, -0.23239839076996, 0.21331153810024, -0.19195850193501, 0.16918689012527, 1709.7579345703, 65.0, 17.0, -0.15616503357887, 0.17915447056293, -0.20116786658764, 0.22138950228691, -0.23904205858707, 0.25342956185341, -0.2639764547348, 0.27025982737541, -0.27203303575516, 0.26923894882202, -0.26201191544533, 0.25066873431206, -0.23568889498711, 0.21768610179424, -0.1973725259304, 0.17551864683628, -0.15291135013103, 1759.8576660156, 67.0, 17.0, -0.15834864974022, 0.18063551187515, -0.20195132493973, 0.22154885530472, -0.23871648311615, 0.25281536579132, -0.26331317424774, 0.26981246471405, -0.27207139134407, 0.27001625299454, -0.2637442946434, 0.25351732969284, -0.23974618315697, 0.22296744585037, -0.20381386578083, 0.18298032879829, -0.16118781268597, 1811.4255371094, 69.0, 17.0, -0.15931145846844, 0.18093319237232, -0.20163267850876, 0.22072559595108, -0.23755857348442, 0.25154137611389, -0.26217636466026, 0.26908338069916, -0.27201873064041, 0.27088701725006, -0.26574504375458, 0.25679808855057, -0.24438807368279, 0.22897529602051, -0.21111415326595, 0.19142484664917, -0.17056252062321, 1864.5042724609, 71.0, 18.0, -0.15913631021976, 0.1801271289587, -0.20027904212475, 0.21896567940712, -0.23558583855629, 0.2495913952589, -0.26051303744316, 0.2679825425148, -0.27174997329712, 0.27169540524483, -0.26783385872841, 0.26031392812729, -0.2494094222784, 0.23550555109978, -0.21907941997051, 0.20067693293095, -0.18088683485985, 0.16031366586685, 1919.1384277344, 73.0, 19.0, -0.15716780722141, 0.17765246331692, -0.19740799069405, 0.21585620939732, -0.23243825137615, 0.24663890898228, -0.25800961256027, 0.26618826389313, -0.27091562747955, 0.27204647660255, -0.26955568790436, 0.26353874802589, -0.25420647859573, 0.24187467992306, -0.22694888710976, 0.20990562438965, -0.19127063453197, 0.17159576714039, -0.15143537521362, 1975.3735351562, 75.0, 19.0, -0.15410894155502, 0.1740896999836, -0.1934747248888, 0.21173183619976, -0.22834166884422, 0.24281898140907, -0.25473296642303, 0.26372539997101, -0.269525796175, 0.27196255326271, -0.27097007632256, 0.26659098267555, -0.25897347927094, 0.24836449325085, -0.23509810864925, 0.21958090364933, -0.20227414369583, 0.18367429077625, -0.16429260373116, 2033.2563476562, 77.0, 20.0, -0.15096558630466, 0.1703594326973, -0.18929740786552, 0.207295358181, -0.22387567162514, 0.23858568072319, -0.25101551413536, 0.26081430912018, -0.26770409941673, 0.27149096131325, -0.27207243442535, 0.26944136619568, -0.2636855840683, 0.25498375296593, -0.24359756708145, 0.22986060380936, -0.21416442096233, 0.19694270193577, -0.17865410447121, 0.15976466238499, 2092.8352050781, 80.0, 20.0, 0.16504815220833, -0.18362960219383, 0.20146203041077, -0.21810331940651, 0.2331283390522, -0.24614453315735, 0.25680661201477, -0.26482945680618, 0.26999899744987, -0.27217984199524, 0.27132040262222, -0.26745435595512, 0.26069876551628, -0.25124916434288, 0.23937144875526, -0.22539140284061, 0.20968189835548, -0.19264873862267, 0.17471566796303, -0.15630914270878, 2154.16015625, 82.0, 21.0, 0.15885248780251, -0.17703697085381, 0.19466806948185, -0.21133923530579, 0.22665329277515, -0.24023613333702, 0.25174987316132, -0.26090478897095, 0.2674694955349, -0.27127933502197, 0.27224186062813, -0.27034002542496, 0.26563233137131, -0.25825029611588, 0.2483933120966, -0.23632092773914, 0.22234320640564, -0.20680941641331, 0.19009554386139, -0.17259123921394, 0.15468667447567, 2217.2817382812, 84.0, 22.0, 0.1510311216116, -0.16886813938618, 0.18634641170502, -0.203090518713, 0.21872787177563, -0.23290081322193, 0.2452783882618, -0.25556737184525, 0.26352202892303, -0.26895248889923, 0.27173087000847, -0.27179551124573, 0.269152790308, -0.26387649774551, 0.25610491633415, -0.24603573977947, 0.23391894996166, -0.22004796564579, 0.2047496587038, -0.18837325274944, 0.17127899825573, -0.15382660925388, 2282.2531738281, 87.0, 22.0, -0.16079890727997, 0.17796525359154, -0.19461525976658, 0.21040566265583, -0.22500084340572, 0.23808315396309, -0.24936287105083, 0.25858733057976, -0.26554882526398, 0.27009123563766, -0.27211493253708, 0.27157962322235, -0.26850542426109, 0.26297190785408, -0.25511518120766, 0.24512316286564, -0.23322911560535, 0.21970403194427, -0.20484781265259, 0.18897975981236, -0.17242874205112, 0.1555233001709, 2349.1281738281, 89.0, 23.0, -0.15111775696278, 0.16796842217445, -0.1845151335001, 0.20044189691544, -0.21543405950069, 0.22918735444546, -0.24141685664654, 0.25186532735825, -0.26031103730202, 0.26657420396805, -0.27052250504494, 0.2720747590065, -0.27120333909988, 0.26793470978737, -0.2623482644558, 0.25457370281219, -0.24478660523891, 0.23320305347443, -0.22007264196873, 0.20567101240158, -0.19029147922993, 0.17423649132252, -0.15780912339687, 2417.962890625, 92.0, 23.0, 0.15816371142864, -0.17439576983452, 0.19023583829403, -0.20539601147175, 0.21959203481674, -0.23255109786987, 0.2440193593502, -0.25376909971237, 0.26160508394241, -0.26737010478973, 0.27094930410385, -0.27227348089218, 0.27132076025009, -0.26811704039574, 0.26273512840271, -0.25529223680496, 0.24594651162624, -0.23489210009575, 0.22235360741615, -0.2085794955492, 0.19383509457111, -0.17839522659779, 0.16253685951233, 2488.8146972656, 95.0, 24.0, -0.16280511021614, 0.17851464450359, -0.19378198683262, 0.20834268629551, -0.22193714976311, 0.23431751132011, -0.24525402486324, 0.25454121828079, -0.26200330257416, 0.26749891042709, -0.27092471718788, 0.2722182571888, -0.27135938405991, 0.26837065815926, -0.26331651210785, 0.25630131363869, -0.24746629595757, 0.23698547482491, -0.22506089508533, 0.21191704273224, -0.19779478013515, 0.18294507265091, -0.16762255132198, 0.15207919478416, 2561.7424316406, 97.0, 25.0, -0.15063217282295, 0.16605861485004, -0.18126437067986, 0.19600750505924, -0.2100455313921, 0.22314131259918, -0.23506884276867, 0.24561884999275, -0.25460407137871, 0.26186388731003, -0.26726838946342, 0.27072161436081, -0.27216395735741, 0.27157342433929, -0.26896622776985, 0.26439595222473, -0.257952272892, 0.24975825846195, -0.23996709287167, 0.2287580370903, -0.21633179485798, 0.20290534198284, -0.18870650231838, 0.17396844923496, -0.15892411768436, 2636.8073730469, 100.0, 26.0, 0.15304520726204, -0.16801336407661, 0.18274486064911, -0.19701756536961, 0.21060939133167, -0.22330339252949, 0.23489268124104, -0.24518539011478, 0.25400909781456, -0.26121497154236, 0.26668128371239, -0.27031633257866, 0.27206042408943, -0.27188736200333, 0.26980486512184, -0.26585429906845, 0.26010939478874, -0.25267440080643, 0.24368141591549, -0.23328694701195, 0.2216681689024, -0.20901857316494, 0.19554334878922, -0.1814546585083, 0.166966766119, -0.15229132771492, 2714.0715332031, 103.0, 26.0, -0.15423575043678, 0.16875725984573, -0.18304663896561, 0.19690056145191, -0.21011574566364, 0.22249335050583, -0.23384335637093, 0.24398869276047, -0.25276926159859, 0.26004540920258, -0.26570120453835, 0.26964688301086, -0.27182081341743, 0.27219098806381, -0.27075546979904, 0.26754236221313, -0.26260903477669, 0.25604072213173, -0.24794834852219, 0.238465949893, -0.2277474552393, 0.21596319973469, -0.20329602062702, 0.1899372190237, -0.17608237266541, 0.16192726790905, 2793.6000976562, 106.0, 27.0, 0.15428647398949, -0.16837356984615, 0.1822495162487, -0.1957286298275, 0.20862498879433, -0.22075624763966, 0.23194728791714, -0.24203398823738, 0.25086656212807, -0.25831279158592, 0.26426070928574, -0.26862114667892, 0.27132934331894, -0.27234655618668, 0.27166053652763, -0.26928585767746, 0.26526346802711, -0.25965964794159, 0.25256446003914, -0.24408978223801, 0.23436667025089, -0.22354257106781, 0.21177814900875, -0.19924379885197, 0.18611615896225, -0.17257453501225, 0.15879729390144, 2875.4587402344, 109.0, 28.0, -0.15215364098549, 0.16591589152813, -0.17950250208378, 0.19274179637432, -0.20546144247055, 0.21749170124531, -0.22866879403591, 0.23883800208569, -0.24785685539246, 0.25559788942337, -0.26195123791695, 0.26682671904564, -0.27015575766563, 0.27189260721207, -0.27201524376869, 0.27052572369576, -0.2674500644207, 0.26283749938011, -0.2567595243454, 0.24930815398693, -0.2405940592289, 0.23074424266815, -0.21989934146404, 0.20821081101894, -0.19583790004253, 0.18294453620911, -0.16969619691372, 0.15625680983067, 2959.7160644531, 112.0, 29.0, 0.15013356506824, -0.16347949206829, 0.17669251561165, -0.18961672484875, 0.20209486782551, -0.21397124230862, 0.22509448230267, -0.23532037436962, 0.24451453983784, -0.2525549530983, 0.25933420658112, -0.26476162672043, 0.26876485347748, -0.27129122614861, 0.27230876684189, -0.2718066573143, 0.26979541778564, -0.26630663871765, 0.26139217615128, -0.25512310862541, 0.24758838117123, -0.23889283835888, 0.22915525734425, -0.21850602328777, 0.2070846259594, -0.19503709673882, 0.18251320719719, -0.16966390609741, 0.15663859248161, 3046.4423828125, 116.0, 29.0, 0.15887962281704, -0.17180316150188, 0.18450585007668, -0.19684301316738, 0.208670347929, -0.21984641253948, 0.23023506999016, -0.2397078871727, 0.24814638495445, -0.25544413924217, 0.26150870323181, -0.26626324653625, 0.26964783668518, -0.27162060141563, 0.2721583545208, -0.27125698328018, 0.2689314186573, -0.26521542668343, 0.26016065478325, -0.25383585691452, 0.24632547795773, -0.23772802948952, 0.22815433144569, -0.21772538125515, 0.20657026767731, -0.19482386112213, 0.18262441456318, -0.17011131346226, 0.15742267668247, 3135.7099609375, 119.0, 30.0, -0.15347999334335, 0.16611668467522, -0.17860110104084, 0.1908003538847, -0.20258094370365, 0.21381095051765, -0.22436214983463, 0.23411214351654, -0.24294637143612, 0.25076007843018, -0.25745996832848, 0.26296591758728, -0.26721221208572, 0.27014860510826, -0.27174127101898, 0.27197316288948, -0.27084437012672, 0.26837205886841, -0.26458996534348, 0.25954788923264, -0.25331073999405, 0.2459572404623, -0.23757869005203, 0.22827723622322, -0.2181641459465, 0.20735791325569, -0.1959822922945, 0.18416419625282, -0.17203177511692, 0.15971228480339, 3227.5932617188, 123.0, 31.0, -0.16075979173183, 0.17291887104511, -0.18487323820591, 0.19650174677372, -0.2076835334301, 0.21829997003078, -0.22823637723923, 0.23738388717175, -0.24564112722874, 0.25291579961777, -0.25912621617317, 0.26420250535011, -0.26808771491051, 0.2707387804985, -0.27212712168694, 0.2722390294075, -0.27107593417168, 0.26865419745445, -0.2650049328804, 0.26017329096794, -0.25421777367592, 0.24720919132233, -0.23922944068909, 0.23037022352219, -0.22073142230511, 0.21041965484619, -0.19954644143581, 0.18822652101517, -0.17657616734505, 0.16471135616302, -0.15274615585804, 3322.1689453125, 126.0, 32.0, 0.15332436561584, -0.16520322859287, 0.17696052789688, -0.18848584592342, 0.19966793060303, -0.21039634943008, 0.22056302428246, -0.23006384074688, 0.23880015313625, -0.24668030440807, 0.25362092256546, -0.25954821705818, 0.26439908146858, -0.26812201738358, 0.27067786455154, -0.27204042673111, 0.272196829319, -0.27114760875702, 0.26890671253204, -0.26550126075745, 0.26097100973129, -0.25536778569221, 0.24875450134277, -0.24120433628559, 0.23279945552349, -0.22362977266312, 0.21379160881042, -0.20338620245457, 0.19251827895641, -0.18129442632198, 0.16982172429562, -0.1582061201334, 3419.5158691406, 130.0, 33.0, 0.15690185129642, -0.16843356192112, 0.17982102930546, -0.19096234440804, 0.20175530016422, -0.21209871768951, 0.22189384698868, -0.23104576766491, 0.23946464061737, -0.2470670491457, 0.25377711653709, -0.25952762365341, 0.26426085829735, -0.2679295539856, 0.27049747109413, -0.2719399034977, 0.2722439467907, -0.2714087665081, 0.26944544911385, -0.26637688279152, 0.26223728060722, -0.25707173347473, 0.25093549489975, -0.24389308691025, 0.23601739108562, -0.22738856077194, 0.21809288859367, -0.20822149515152, 0.19786912202835, -0.18713283538818, 0.17611064016819, -0.16490025818348, 0.15359778702259, 3519.7153320312, 134.0, 34.0, 0.15900883078575, -0.17018294334412, 0.18120746314526, -0.19198907911777, 0.20243428647518, -0.21245062351227, 0.22194780409336, -0.2308389544487, 0.23904167115688, -0.24647924304008, 0.25308153033257, -0.25878602266312, 0.26353853940964, -0.26729407906532, 0.27001735568047, -0.27168324589729, 0.27227711677551, -0.2717949450016, 0.27024349570274, -0.2676400244236, 0.26401203870773, -0.25939697027206, 0.2538415491581, -0.24740117788315, 0.24013908207417, -0.23212552070618, 0.22343674302101, -0.21415400505066, 0.20436245203018, -0.19415001571178, 0.18360628187656, -0.17282132804394, 0.16188462078571, -0.15088395774364, 3622.8510742188, 138.0, 34.0, 0.16008332371712, -0.17093254625797, 0.18163484334946, -0.19210459291935, 0.2022560685873, -0.21200446784496, 0.22126695513725, -0.22996366024017, 0.23801872134209, -0.24536116421223, 0.25192585587502, -0.25765430927277, 0.26249530911446, -0.26640579104424, 0.26935109496117, -0.271305590868, 0.27225288748741, -0.27218610048294, 0.27110782265663, -0.26903003454208, 0.2659740447998, -0.2619700729847, 0.25705689191818, -0.25128117203712, 0.2446970641613, -0.23736527562141, 0.2293523401022, -0.22072984278202, 0.21157339215279, -0.20196169614792, 0.19197565317154, -0.18169730901718, 0.17120888829231, -0.16059185564518, 3729.0085449219, 142.0, 36.0, 0.15983611345291, -0.1703527867794, 0.18073749542236, -0.19091227650642, 0.20079892873764, -0.21031992137432, 0.21939927339554, -0.2279634475708, 0.23594218492508, -0.24326936900616, 0.24988377094269, -0.25572979450226, 0.26075813174248, -0.26492637395859, 0.26819941401482, -0.27054998278618, 0.27195891737938, -0.27241533994675, 0.27191677689552, -0.27046918869019, 0.2680869102478, -0.26479235291481, 0.26061573624611, -0.25559476017952, 0.24977408349514, -0.24320468306541, 0.23594333231449, -0.22805187106133, 0.21959643065929, -0.2106466293335, 0.20127479732037, -0.19155512750149, 0.18156279623508, -0.17137314379215, 0.16106082499027, -0.15069906413555, 3838.2768554688, 146.0, 37.0, 0.15706184506416, -0.16735398769379, 0.17753779888153, -0.18754102289677, 0.197291046381, -0.20671565830708, 0.21574379503727, -0.22430634498596, 0.23233692348003, -0.23977257311344, 0.24655450880527, -0.25262874364853, 0.25794669985771, -0.26246577501297, 0.26614981889725, -0.26896947622299, 0.27090260386467, -0.2719344496727, 0.27205783128738, -0.27127310633659, 0.26958835124969, -0.26701903343201, 0.26358792185783, -0.2593247294426, 0.25426584482193, -0.24845387041569, 0.24193702638149, -0.23476864397526, 0.2270065844059, -0.21871253848076, 0.20995128154755, -0.20079004764557, 0.1912976950407, -0.18154403567314, 0.17159903049469, -0.16153213381767, 0.15141147375107, 3950.7470703125, 150.0, 38.0, 0.15497525036335, -0.164974629879, 0.17488873004913, -0.18465170264244, 0.19419723749161, -0.20345914363861, 0.21237209439278, -0.22087219357491, 0.22889778017998, -0.23638994991779, 0.24329319596291, -0.24955607950687, 0.25513169169426, -0.25997811555862, 0.26405897736549, -0.26734375953674, 0.2698081433773, -0.2714341878891, 0.27221059799194, -0.27213278412819, 0.27120292186737, -0.26942986249924, 0.26682904362679, -0.26342225074768, 0.25923743844032, -0.25430834293365, 0.24867413938046, -0.24237895011902, 0.23547139763832, -0.22800403833389, 0.22003284096718, -0.21161651611328, 0.202815964818, -0.19369360804558, 0.18431274592876, -0.17473694682121, 0.16502940654755, -0.15525236725807, 4066.5126953125, 154.0, 40.0, 0.15176036953926, -0.16144073009491, 0.17106585204601, -0.18057644367218, 0.18991248309612, -0.19901379942894, 0.20782059431076, -0.21627405285835, 0.22431689500809, -0.23189395666122, 0.23895271122456, -0.24544379115105, 0.25132155418396, -0.25654435157776, 0.26107519865036, -0.26488196849823, 0.26793766021729, -0.27022090554237, 0.27171593904495, -0.27241280674934, 0.27230760455132, -0.27140226960182, 0.2697046995163, -0.26722857356071, 0.26399332284927, -0.26002371311188, 0.25534975528717, -0.25000631809235, 0.24403269588947, -0.23747234046459, 0.23037227988243, -0.22278268635273, 0.21475636959076, -0.206348285079, 0.19761490821838, -0.18861377239227, 0.1794028878212, -0.17004017531872, 0.16058298945427, -0.15108753740788, 4185.6704101562, 159.0, 40.0, -0.15551248192787, 0.16494189202785, -0.17429609596729, 0.18351984024048, -0.19255746901035, 0.2013533115387, -0.20985229313374, 0.21800032258034, -0.22574488818645, 0.23303546011448, -0.23982407152653, 0.24606564640999, -0.25171849131584, 0.25674471259117, -0.26111054420471, 0.26478660106659, -0.26774826645851, 0.2699758708477, -0.27145487070084, 0.27217596769333, -0.27213516831398, 0.27133390307426, -0.26977890729904, 0.26748219132423, -0.26446080207825, 0.26073682308197, -0.25633701682091, 0.25129255652428, -0.24563881754875, 0.23941487073898, -0.23266322910786, 0.22542937099934, -0.21776129305363, 0.20970913767815, -0.20132461190224, 0.19266059994698, -0.18377061188221, 0.17470839619637, -0.16552734375, 0.1562801450491, 4308.3203125, 163.0, 42.0, -0.15062861144543, 0.15977300703526, -0.16887746751308, 0.17789225280285, -0.18676692247391, 0.19545079767704, -0.2038933634758, 0.21204474568367, -0.21985602378845, 0.22727981209755, -0.23427055776119, 0.24078498780727, -0.24678249657154, 0.25222551822662, -0.25707978010178, 0.26131471991539, -0.26490366458893, 0.26782414317131, -0.27005803585052, 0.27159169316292, -0.27241611480713, 0.27252700924873, -0.27192476391792, 0.27061456441879, -0.26860615611076, 0.26591384410858, -0.26255631446838, 0.25855651497841, -0.25394132733345, 0.24874140322208, -0.2429908066988, 0.2367267459631, -0.22998920083046, 0.22282056510448, -0.21526527404785, 0.20736940205097, -0.19918024539948, 0.19074594974518, -0.18211504817009, 0.1733361184597, -0.16445732116699, 0.15552607178688, 4434.5634765625, 168.0, 43.0, 0.15201798081398, -0.16092801094055, 0.16979229450226, -0.1785647124052, 0.1871986836195, -0.19564738869667, 0.20386424660683, -0.21180322766304, 0.21941924095154, -0.22666855156422, 0.23350909352303, -0.23990082740784, 0.24580608308315, -0.25118988752365, 0.25602021813393, -0.26026833057404, 0.26390895247459, -0.26692047715187, 0.26928520202637, -0.27098947763443, 0.27202367782593, -0.27238246798515, 0.27206471562386, -0.27107346057892, 0.26941603422165, -0.26710379123688, 0.26415213942528, -0.26058036088943, 0.25641134381294, -0.25167149305344, 0.24639044702053, -0.24060082435608, 0.23433789610863, -0.22763931751251, 0.22054480016232, -0.21309578418732, 0.20533508062363, -0.19730648398399, 0.18905448913574, -0.18062387406826, 0.17205937206745, -0.16340532898903, 0.15470536053181, 4564.5063476562, 173.0, 44.0, -0.15216438472271, 0.16084058582783, -0.16947241127491, 0.17801737785339, -0.18643255531788, 0.19467478990555, -0.20270112156868, 0.21046909689903, -0.21793703734875, 0.22506445646286, -0.23181228339672, 0.23814323544502, -0.24402205646038, 0.2494158744812, -0.25429439544678, 0.25863012671471, -0.26239866018295, 0.26557889580727, -0.26815298199654, 0.27010682225227, -0.27142977714539, 0.27211505174637, -0.27215963602066, 0.27156427502632, -0.27033346891403, 0.26847547292709, -0.26600220799446, 0.26292911171913, -0.25927504897118, 0.25506207346916, -0.25031530857086, 0.24506278336048, -0.23933504521847, 0.23316502571106, -0.2265877276659, 0.21963998675346, -0.21236009895802, 0.20478756725788, -0.19696283340454, 0.18892687559128, -0.18072095513344, 0.17238631844521, -0.16396386921406, 0.15549387037754, 4698.2563476562, 178.0, 45.0, 0.15113896131516, -0.15958435833454, 0.16799253225327, -0.17632450163364, 0.18454077839851, -0.19260169565678, 0.20046763122082, -0.2080993950367, 0.21545840799809, -0.22250705957413, 0.22920893132687, -0.23552909493446, 0.2414343804121, -0.24689361453056, 0.25187781453133, -0.25636047124863, 0.26031771302223, -0.26372846961021, 0.26657468080521, -0.26884132623672, 0.27051666378975, -0.27159222960472, 0.27206292748451, -0.27192702889442, 0.27118617296219, -0.26984542608261, 0.26791313290596, -0.26540091633797, 0.26232349872589, -0.25869870185852, 0.25454711914062, -0.2498921751976, 0.24475973844528, -0.23917804658413, 0.23317742347717, -0.22679004073143, 0.22004972398281, -0.21299165487289, 0.20565211772919, -0.19806824624538, 0.19027771055698, -0.18231852352619, 0.17422869801521, -0.16604600846767, 0.15780775249004, 4835.92578125, 183.0, 47.0, -0.15092515945435, 0.15905471146107, -0.16715632379055, 0.17519509792328, -0.18313567340374, 0.19094240665436, -0.1985796391964, 0.20601193606853, -0.21320433914661, 0.22012257575989, -0.2267332971096, 0.23300434648991, -0.23890496790409, 0.24440598487854, -0.24948005378246, 0.25410184264183, -0.25824820995331, 0.26189836859703, -0.26503396034241, 0.26763936877251, -0.26970160007477, 0.27121058106422, -0.27215903997421, 0.27254271507263, -0.27236026525497, 0.27161335945129, -0.27030652761459, 0.26844730973244, -0.26604601740837, 0.26311576366425, -0.25967234373093, 0.25573405623436, -0.2513216137886, 0.24645800888538, -0.24116824567318, 0.23547929525375, -0.22941981256008, 0.22301991283894, -0.21631103754044, 0.20932565629482, -0.20209707319736, 0.1946592181921, -0.18704637885094, 0.17929299175739, -0.17143340408802, 0.16350166499615, -0.15553130209446, 4977.6293945312, 189.0, 48.0, -0.15579296648502, 0.16368609666824, -0.17153373360634, 0.17930354177952, -0.18696287274361, 0.19447891414165, -0.20181900262833, 0.20895074307919, -0.21584224700928, 0.22246234118938, -0.22878077626228, 0.23476842045784, -0.24039743840694, 0.24564151465893, -0.25047597289085, 0.2548780143261, -0.25882676243782, 0.26230353116989, -0.26529183983803, 0.26777759194374, -0.26974910497665, 0.27119728922844, -0.27211558818817, 0.27250003814697, -0.27234941720963, 0.27166506648064, -0.27045100927353, 0.26871386170387, -0.26646277308464, 0.26370936632156, -0.26046770811081, 0.25675410032272, -0.25258708000183, 0.24798718094826, -0.24297685921192, 0.23758032917976, -0.23182336986065, 0.2257331609726, -0.21933811903, 0.21266767382622, -0.2057521045208, 0.19862234592438, -0.19130972027779, 0.18384583294392, -0.17626231908798, 0.16859066486359, -0.16086199879646, 0.15310694277287, 5123.4848632812, 194.0, 50.0, 0.15160305798054, -0.1592842489481, 0.1669392734766, -0.17453871667385, 0.1820527613163, -0.18945138156414, 0.19670447707176, -0.20378214120865, 0.21065476536751, -0.21729324758053, 0.22366917133331, -0.22975495457649, 0.23552405834198, -0.24095116555691, 0.24601228535175, -0.25068491697311, 0.25494822859764, -0.25878316164017, 0.262172549963, -0.26510125398636, 0.26755619049072, -0.26952648162842, 0.27100348472595, -0.2719809114933, 0.2724546790123, -0.27242323756218, 0.27188724279404, -0.2708497941494, 0.26931628584862, -0.26729443669319, 0.26479411125183, -0.26182746887207, 0.25840863585472, -0.25455379486084, 0.25028094649315, -0.2456099241972, 0.24056212604046, -0.23516044020653, 0.22942914068699, -0.22339364886284, 0.2170804142952, -0.21051673591137, 0.2037306278944, -0.1967505812645, 0.18960545957088, -0.18232429027557, 0.17493607103825, -0.16746965050697, 0.15995356440544, -0.15241581201553, 5273.6147460938, 200.0, 51.0, 0.15402720868587, -0.16148194670677, 0.16890425980091, -0.17626708745956, 0.18354307115078, -0.19070465862751, 0.19772431254387, -0.20457465946674, 0.21122859418392, -0.21765951812267, 0.22384142875671, -0.22974909842014, 0.23535822331905, -0.24064555764198, 0.24558904767036, -0.2501679956913, 0.25436308979988, -0.25815668702126, 0.26153275370598, -0.26447701454163, 0.26697707176208, -0.2690224647522, 0.27060467004776, -0.27171722054482, 0.27235576510429, -0.27251797914505, 0.27220368385315, -0.27141472697258, 0.27015519142151, -0.26843103766441, 0.26625040173531, -0.26362323760986, 0.26056149601936, -0.25707891583443, 0.25319093465805, -0.24891467392445, 0.24426876008511, -0.23927322030067, 0.23394939303398, -0.22831976413727, 0.2224078476429, -0.21623802185059, 0.2098354101181, -0.20322576165199, 0.19643522799015, -0.18949024379253, 0.1824174374342, -0.17524340748787, 0.16799455881119, -0.16069708764553, 0.1533766835928, 5428.1430664062, 206.0, 52.0, 0.15524047613144, -0.16247195005417, 0.16966991126537, -0.17680954933167, 0.18386580049992, -0.19081351161003, 0.19762745499611, -0.20428259670734, 0.21075412631035, -0.21701768040657, 0.22304940223694, -0.22882610559464, 0.23432540893555, -0.23952586948872, 0.24440702795982, -0.24894963204861, 0.25313568115234, -0.25694853067398, 0.26037299633026, -0.26339542865753, 0.26600378751755, -0.26818776130676, 0.26993873715401, -0.27124989032745, 0.27211624383926, -0.27253466844559, 0.27250388264656, -0.27202448248863, 0.27109891176224, -0.26973152160645, 0.26792839169502, -0.26569744944572, 0.26304829120636, -0.25999221205711, 0.25654211640358, -0.25271242856979, 0.24851900339127, -0.24397902190685, 0.23911094665527, -0.23393435776234, 0.22846983373165, -0.2227389216423, 0.21676389873028, -0.21056772768497, 0.2041739076376, -0.19760635495186, 0.19088923931122, -0.1840468943119, 0.17710365355015, -0.17008377611637, 0.16301126778126, -0.15590980648994, 5587.2001953125, 212.0, 54.0, 0.15532705187798, -0.1623393446207, 0.16932108998299, -0.17624969780445, 0.18310230970383, -0.18985591828823, 0.19648753106594, -0.20297423005104, 0.20929332077503, -0.21542243659496, 0.22133965790272, -0.22702360153198, 0.23245358467102, -0.23760968446732, 0.24247285723686, -0.24702505767345, 0.25124931335449, -0.25512981414795, 0.25865200161934, -0.26180264353752, 0.26456990838051, -0.26694342494011, 0.26891434192657, -0.27047535777092, 0.27162078022957, -0.27234652638435, 0.27265018224716, -0.27253094315529, 0.27198976278305, -0.27102911472321, 0.26965317130089, -0.26786774396896, 0.26568016409874, -0.26309928297997, 0.26013547182083, -0.256800532341, 0.25310751795769, -0.24907091259956, 0.24470627307892, -0.24003031849861, 0.23506081104279, -0.22981639206409, 0.22431656718254, -0.2185815423727, 0.21263214945793, -0.20648972690105, 0.20017600059509, -0.19371299445629, 0.18712289631367, -0.18042795360088, 0.17365036904812, -0.16681222617626, 0.15993529558182, -0.15304100513458, 5750.9174804688, 218.0, 55.0, 0.15218678116798, -0.15908049046993, 0.165951192379, -0.17277771234512, 0.17953863739967, -0.18621237576008, 0.19277736544609, -0.19921205937862, 0.20549507439137, -0.21160534024239, 0.21752209961414, -0.22322511672974, 0.22869473695755, -0.23391193151474, 0.23885846138, -0.24351696670055, 0.24787099659443, -0.25190517306328, 0.25560513138771, -0.25895777344704, 0.26195120811462, -0.2645748257637, 0.26681938767433, -0.2686770260334, 0.2701413333416, -0.27120733261108, 0.27187159657478, -0.27213209867477, 0.27198839187622, -0.27144151926041, 0.27049401402473, -0.26914989948273, 0.2674146592617, -0.26529517769814, 0.26279976963997, -0.25993800163269, 0.25672084093094, -0.25316041707993, 0.24927002191544, -0.24506406486034, 0.24055795371532, -0.23576804995537, 0.23071154952049, -0.22540643811226, 0.21987135708332, -0.21412551403046, 0.20818863809109, -0.2020808160305, 0.19582243263721, -0.18943409621716, 0.18293644487858, -0.17635016143322, 0.16969583928585, -0.16299384832382, 0.15626427531242, 5919.4321289062, 224.0, 58.0, 0.15019020438194, -0.15687717497349, 0.16354960203171, -0.17018826305866, 0.17677366733551, -0.1832861751318, 0.18970607221127, -0.19601362943649, 0.20218926668167, -0.20821356773376, 0.21406738460064, -0.21973197162151, 0.22518898546696, -0.23042067885399, 0.23540990054607, -0.24014021456242, 0.24459592998028, -0.24876226484776, 0.25262531638145, -0.2561722099781, 0.25939106941223, -0.2622711956501, 0.26480293273926, -0.26697796583176, 0.26878914237022, -0.2702305316925, 0.27129757404327, -0.27198702096939, 0.2722969353199, -0.27222666144371, 0.27177700400352, -0.27094998955727, 0.26974898576736, -0.26817867159843, 0.26624497771263, -0.26395511627197, 0.26131746172905, -0.2583415210247, 0.25503796339035, -0.25141847133636, 0.24749575555325, -0.24328342080116, 0.23879598081112, -0.23404869437218, 0.22905756533146, -0.22383925318718, 0.2184109389782, -0.21279034018517, 0.20699553191662, -0.20104490220547, 0.19495710730553, -0.1887509226799, 0.18244518339634, -0.17605870962143, 0.16961024701595, -0.16311833262444, 0.15660125017166, -0.15007694065571, 6092.884765625, 231.0, 59.0, -0.15376305580139, 0.16023603081703, -0.16668739914894, 0.17309956252575, -0.17945465445518, 0.18573476374149, -0.19192191958427, 0.19799815118313, -0.20394563674927, 0.20974673330784, -0.21538405120373, 0.22084055840969, -0.22609962522984, 0.23114512860775, -0.23596146702766, 0.24053370952606, -0.24484759569168, 0.24888963997364, -0.25264713168144, 0.25610828399658, -0.25926223397255, 0.26209905743599, -0.26460984349251, 0.26678678393364, -0.26862314343452, 0.27011325955391, -0.27125269174576, 0.27203810214996, -0.27246734499931, 0.27253943681717, -0.27225464582443, 0.27161428332329, -0.27062097191811, 0.26927843689919, -0.26759150624275, 0.26556614041328, -0.26320940256119, 0.26052936911583, -0.25753518939018, 0.25423684716225, -0.25064533948898, 0.24677254259586, -0.24263106286526, 0.23823429644108, -0.23359631001949, 0.2287318110466, -0.22365605831146, 0.21838477253914, -0.21293412148952, 0.20732060074806, -0.20156098902225, 0.1956722587347, -0.1896715015173, 0.18357589840889, -0.1774025708437, 0.17116859555244, -0.16489088535309, 0.158586114645, -0.15227068960667, 6271.419921875, 238.0, 60.0, 0.15307119488716, -0.15938717126846, 0.16568407416344, -0.17194558680058, 0.17815521359444, -0.18429632484913, 0.19035223126411, -0.19630628824234, 0.20214185118675, -0.20784249901772, 0.21339195966721, -0.21877427399158, 0.22397382557392, -0.22897535562515, 0.23376415669918, -0.23832599818707, 0.24264726042747, -0.24671497941017, 0.25051689147949, -0.25404152274132, 0.25727814435959, -0.26021695137024, 0.26284897327423, -0.26516622304916, 0.26716163754463, -0.26882922649384, 0.27016392350197, -0.27116173505783, 0.2718198299408, -0.27213630080223, 0.27211037278175, -0.27174243330956, 0.27103382349014, -0.26998701691628, 0.26860556006432, -0.26689401268959, 0.26485797762871, -0.26250401139259, 0.25983965396881, -0.25687342882156, 0.25361469388008, -0.25007367134094, 0.24626135826111, -0.24218958616257, 0.23787082731724, -0.23331823945045, 0.22854553163052, -0.22356699407101, 0.21839737892151, -0.21305184066296, 0.20754587650299, -0.20189528167248, 0.1961160749197, -0.19022440910339, 0.18423654139042, -0.17816872894764, 0.17203721404076, -0.16585811972618, 0.15964740514755, -0.15342080593109, 6455.1865234375, 245.0, 62.0, -0.15432192385197, 0.16043084859848, -0.16652019321918, 0.17257510125637, -0.1785806119442, 0.18452161550522, -0.19038298726082, 0.19614958763123, -0.20180632174015, 0.20733827352524, -0.21273066103458, 0.21796895563602, -0.22303891181946, 0.22792665660381, -0.23261867463589, 0.23710195720196, -0.24136400222778, 0.2453928142786, -0.24917705357075, 0.25270602107048, -0.25596970319748, 0.25895881652832, -0.26166489720345, 0.26408019661903, -0.26619786024094, 0.26801189780235, -0.26951721310616, 0.27070957422256, -0.27158570289612, 0.27214327454567, -0.27238082885742, 0.27229797840118, -0.27189514040947, 0.27117383480072, -0.27013635635376, 0.2687860429287, -0.26712712645531, 0.26516470313072, -0.26290473341942, 0.26035407185555, -0.25752034783363, 0.25441199541092, -0.25103813409805, 0.24740873277187, -0.24353429675102, 0.23942601680756, -0.23509564995766, 0.23055547475815, -0.2258182913065, 0.22089727222919, -0.21580602228642, 0.21055844426155, -0.2051687091589, 0.19965122640133, -0.19402050971985, 0.18829123675823, -0.18247811496258, 0.17659582197666, -0.17065900564194, 0.16468219459057, -0.15867973864079, 0.1526657640934, 6644.337890625, 252.0, 64.0, 0.15451297163963, -0.16041362285614, 0.16629710793495, -0.17215007543564, 0.17795896530151, -0.18371015787125, 0.18938994407654, -0.19498464465141, 0.20048061013222, -0.2058642655611, 0.211122199893, -0.21624118089676, 0.22120822966099, -0.22601062059402, 0.23063598573208, -0.23507232964039, 0.23930808901787, -0.24333216249943, 0.2471339404583, -0.25070336461067, 0.25403097271919, -0.25710794329643, 0.25992605090141, -0.26247781515121, 0.26475644111633, -0.266755849123, 0.26847073435783, -0.26989662647247, 0.27102974057198, -0.27186721563339, 0.27240693569183, -0.27264764904976, 0.27258890867233, -0.27223110198975, 0.27157545089722, -0.27062401175499, 0.26937964558601, -0.26784601807594, 0.26602756977081, -0.26392951607704, 0.26155778765678, -0.25891909003258, 0.25602081418037, -0.25287100672722, 0.2494783103466, -0.24585200846195, 0.24200198054314, -0.23793855309486, 0.23367260396481, -0.22921544313431, 0.22457873821259, -0.21977458894253, 0.21481534838676, -0.20971366763115, 0.20448240637779, -0.19913458824158, 0.19368340075016, -0.18814206123352, 0.1825238764286, -0.17684209346771, 0.17110992968082, -0.16534046828747, 0.15954668819904, -0.15374134480953, 6839.0317382812, 259.0, 66.0, -0.15117271244526, 0.15696389973164, -0.16274370253086, 0.16849964857101, -0.17421911656857, 0.17988938093185, -0.18549765646458, 0.19103112816811, -0.1964770257473, 0.20182265341282, -0.20705537497997, 0.21216277778149, -0.21713261306286, 0.22195288538933, -0.22661185264587, 0.23109813034534, -0.23540067672729, 0.23950886726379, -0.24341250956059, 0.24710190296173, -0.25056782364845, 0.25380158424377, -0.25679513812065, 0.25954097509384, -0.26203221082687, 0.26426267623901, -0.26622676849365, 0.26791971921921, -0.2693372964859, 0.27047616243362, -0.27133357524872, 0.27190762758255, -0.27219706773758, 0.27220150828362, -0.27192121744156, 0.27135726809502, -0.27051141858101, 0.26938620209694, -0.26798489689827, 0.26631146669388, -0.26437050104141, 0.26216739416122, -0.25970813632011, 0.25699928402901, -0.25404810905457, 0.25086238980293, -0.24745051562786, 0.24382132291794, -0.23998418450356, 0.23594892024994, -0.23172573745251, 0.22732524573803, -0.22275841236115, 0.21803647279739, -0.21317094564438, 0.20817355811596, -0.20305621623993, 0.19783101975918, -0.19251008331776, 0.187105640769, -0.18162994086742, 0.17609517276287, -0.17051351070404, 0.16489699482918, -0.15925754606724, 0.1536069214344, 7039.4306640625, 267.0, 68.0, -0.15499925613403, 0.16058906912804, -0.16616266965866, 0.17170868813992, -0.17721562087536, 0.1826719045639, -0.1880659610033, 0.19338615238667, -0.1986209154129, 0.20375874638557, -0.20878826081753, 0.21369817852974, -0.21847747266293, 0.22311525046825, -0.22760093212128, 0.23192419111729, -0.23607507348061, 0.24004390835762, -0.24382147192955, 0.24739892780781, -0.25076788663864, 0.25392046570778, -0.25684925913811, 0.25954738259315, -0.26200848817825, 0.2642268538475, -0.26619726419449, 0.2679151892662, -0.26937666535378, 0.27057835459709, -0.27151763439178, 0.27219244837761, -0.27260142564774, 0.27274388074875, -0.272619754076, 0.27222967147827, -0.27157488465309, 0.2706573009491, -0.26947951316833, 0.26804468035698, -0.26635664701462, 0.26441982388496, -0.26223918795586, 0.2598203420639, -0.25716942548752, 0.25429305434227, -0.25119841098785, 0.2478931248188, -0.24438528716564, 0.24068342149258, -0.23679640889168, 0.23273353278637, -0.22850440442562, 0.2241189032793, -0.21958720684052, 0.21491970121861, -0.21012699604034, 0.20521984994411, -0.20020912587643, 0.1951058357954, -0.18992099165916, 0.18466567993164, -0.17935092747211, 0.17398774623871, -0.16858705878258, 0.16315969824791, -0.15771633386612, 0.15226747095585, 7245.7021484375, 275.0, 69.0, -0.15418562293053, 0.15962673723698, -0.16505415737629, 0.17045742273331, -0.17582596838474, 0.18114916980267, -0.18641632795334, 0.1916167140007, -0.19673965871334, 0.20177447795868, -0.20671060681343, 0.2115375995636, -0.21624511480331, 0.2208230048418, -0.22526134550571, 0.22955040633678, -0.2336807847023, 0.23764330148697, -0.24142917990685, 0.24502994120121, -0.24843752384186, 0.25164422392845, -0.25464284420013, 0.25742655992508, -0.25998911261559, 0.26232460141182, -0.26442781090736, 0.26629391312599, -0.26791873574257, 0.2692985534668, -0.27043032646179, 0.27131152153015, -0.27194023132324, 0.27231508493423, -0.27243539690971, 0.27230101823807, -0.27191239595413, 0.27127063274384, -0.27037736773491, 0.26923480629921, -0.26784583926201, 0.26621383428574, -0.26434275507927, 0.26223704218864, -0.25990179181099, 0.25734248757362, -0.25456517934799, 0.2515763938427, -0.24838303029537, 0.24499250948429, -0.2414126098156, 0.23765151202679, -0.23371770977974, 0.2296200543642, -0.22536770999432, 0.22097004950047, -0.21643674373627, 0.21177764236927, -0.2070027589798, 0.20212230086327, -0.19714653491974, 0.19208584725857, -0.18695065379143, 0.18175140023232, -0.17649851739407, 0.17120242118835, -0.16587340831757, 0.16052171587944, -0.15515743196011, 7458.0170898438, 282.0, 73.0, 0.15062871575356, -0.15586814284325, 0.16110274195671, -0.16632324457169, 0.1715203076601, -0.17668442428112, 0.18180607259274, -0.1868756711483, 0.19188359379768, -0.1968202739954, 0.2016761302948, -0.20644170045853, 0.21110756695271, -0.21566444635391, 0.2201032191515, -0.22441489994526, 0.22859074175358, -0.23262220621109, 0.23650097846985, -0.24021905660629, 0.24376870691776, -0.24714252352715, 0.2503334581852, -0.25333479046822, 0.25614023208618, -0.25874388217926, 0.26114016771317, -0.26332411170006, 0.26529106497765, -0.26703688502312, 0.26855790615082, -0.26985093951225, 0.27091330289841, -0.27174282073975, 0.27233779430389, -0.2726970911026, 0.27282005548477, -0.27270659804344, 0.27235707640648, -0.27177241444588, 0.27095404267311, -0.26990389823914, 0.26862442493439, -0.26711854338646, 0.26538968086243, -0.2634417116642, 0.26127898693085, -0.2589063346386, 0.25632894039154, -0.25355249643326, 0.25058302283287, -0.24742692708969, 0.24409101903439, -0.24058239161968, 0.23690851032734, -0.23307709395885, 0.22909614443779, -0.22497391700745, 0.22071889042854, -0.2163397371769, 0.21184527873993, -0.20724454522133, 0.20254661142826, -0.1977607011795, 0.19289608299732, -0.18796207010746, 0.18296800553799, -0.17792320251465, 0.17283694446087, -0.16771848499775, 0.16257692873478, -0.15742135047913, 0.1522606164217, 7676.5537109375, 291.0, 74.0, -0.15371163189411, 0.15885147452354, -0.16398000717163, 0.16908842325211, -0.17416785657406, 0.17920938134193, -0.18420402705669, 0.18914277851582, -0.19401666522026, 0.19881673157215, -0.20353408157825, 0.20815989375114, -0.21268548071384, 0.21710221469402, -0.22140169143677, 0.22557565569878, -0.22961603105068, 0.23351499438286, -0.23726493120193, 0.24085852503777, -0.24428869783878, 0.24754872918129, -0.25063216686249, 0.25353297591209, -0.25624534487724, 0.25876399874687, -0.26108393073082, 0.26320055127144, -0.26510974764824, 0.26680779457092, -0.2682913839817, 0.26955765485764, -0.27060422301292, 0.27142912149429, -0.27203091979027, 0.27240860462189, -0.2725615799427, 0.27248981595039, -0.27219370007515, 0.27167409658432, -0.27093228697777, 0.26997011899948, -0.26878973841667, 0.267393887043, -0.26578566431999, 0.26396858692169, -0.26194661855698, 0.25972408056259, -0.25730577111244, 0.25469678640366, -0.25190258026123, 0.24892899394035, -0.24578216671944, 0.24246855080128, -0.23899488151073, 0.23536817729473, -0.23159569501877, 0.22768491506577, -0.22364354133606, 0.21947944164276, -0.21520066261292, 0.21081538498402, -0.20633190870285, 0.20175863802433, -0.19710402190685, 0.19237659871578, -0.18758490681648, 0.18273749947548, -0.17784290015697, 0.17290963232517, -0.16794610023499, 0.16296066343784, -0.15796159207821, 0.15295700728893, 7901.494140625, 300.0, 76.0, 0.1543715596199, -0.15936410427094, 0.16434572637081, -0.16930837929249, 0.17424389719963, -0.17914406955242, 0.18400064110756, -0.18880534172058, 0.19354988634586, -0.19822598993778, 0.20282544195652, -0.2073400914669, 0.21176181733608, -0.21608267724514, 0.22029477357864, -0.22439041733742, 0.22836205363274, -0.23220230638981, 0.23590402305126, -0.23946025967598, 0.24286431074142, -0.24610973894596, 0.24919037520885, -0.2521003484726, 0.25483411550522, -0.25738644599915, 0.25975239276886, -0.26192745566368, 0.26390740275383, -0.26568847894669, 0.26726722717285, -0.26864060759544, 0.26980602741241, -0.27076125144958, 0.27150446176529, -0.2720342874527, 0.27234980463982, -0.2724504172802, 0.2723360657692, -0.27200707793236, 0.2714641392231, -0.27070850133896, 0.2697417140007, -0.26856577396393, 0.26718312501907, -0.26559656858444, 0.26380932331085, -0.26182496547699, 0.25964751839638, -0.25728127360344, 0.25473096966743, -0.25200155377388, 0.24909846484661, -0.24602730572224, 0.2427940517664, -0.23940493166447, 0.23586644232273, -0.23218530416489, 0.22836849093437, -0.22442317008972, 0.2203566879034, -0.21617655456066, 0.21189045906067, -0.20750616490841, 0.20303159952164, -0.19847472012043, 0.19384358823299, -0.18914629518986, 0.18439097702503, -0.17958571016788, 0.17473864555359, -0.16985782980919, 0.16495126485825, -0.16002690792084, 0.15509256720543, -0.150156006217, 8133.025390625, 308.0, 79.0, 0.15320315957069, -0.15799634158611, 0.16278265416622, -0.16755495965481, 0.17230606079102, -0.17702865600586, 0.18171544373035, -0.18635906279087, 0.19095213711262, -0.1954872906208, 0.19995720684528, -0.20435455441475, 0.20867209136486, -0.21290265023708, 0.21703913807869, -0.22107456624508, 0.22500209510326, -0.22881501913071, 0.23250676691532, -0.23607099056244, 0.23950147628784, -0.24279224872589, 0.24593755602837, -0.24893188476562, 0.25176993012428, -0.25444668531418, 0.25695744156837, -0.25929769873619, 0.26146334409714, -0.2634505033493, 0.26525563001633, -0.26687556505203, 0.26830744743347, -0.2695486843586, 0.27059715986252, -0.27145099639893, 0.27210876345634, -0.27256932854652, 0.27283197641373, -0.27289628982544, 0.27276226878166, -0.27243024110794, 0.27190098166466, -0.27117550373077, 0.27025526762009, -0.26914206147194, 0.26783803105354, -0.26634564995766, 0.26466771960258, -0.26280742883682, 0.26076820492744, -0.25855389237404, 0.25616848468781, -0.2536164522171, 0.25090235471725, -0.24803119897842, 0.24500812590122, -0.24183854460716, 0.2385281175375, -0.23508270084858, 0.23150835931301, -0.22781133651733, 0.2239980250597, -0.22007501125336, 0.21604897081852, -0.21192672848701, 0.2077152132988, -0.20342141389847, 0.19905240833759, -0.19461531937122, 0.19011732935905, -0.1855655759573, 0.18096727132797, -0.17632956802845, 0.17165960371494, -0.16696445643902, 0.1622511446476, -0.15752662718296, 0.15279772877693, 8371.3408203125, 317.0, 81.0, -0.15276885032654, 0.1574735045433, -0.16217111051083, 0.16685496270657, -0.17151826620102, 0.1761541813612, -0.18075585365295, 0.18531635403633, -0.18982879817486, 0.19428627192974, -0.19868192076683, 0.20300889015198, -0.207260414958, 0.2114297747612, -0.21551035344601, 0.21949562430382, -0.22337917983532, 0.22715474665165, -0.2308161854744, 0.23435755074024, -0.23777301609516, 0.24105700850487, -0.24420408904552, 0.2472090870142, -0.25006702542305, 0.25277316570282, -0.25532305240631, 0.25771245360374, -0.25993740558624, 0.26199424266815, -0.2638795375824, 0.2655902504921, -0.26712357997894, 0.26847699284554, -0.26964837312698, 0.27063581347466, -0.27143782377243, 0.27205315232277, -0.27248096466064, 0.27272066473961, -0.27277207374573, 0.27263525128365, -0.27231067419052, 0.27179908752441, -0.27110156416893, 0.27021953463554, -0.26915469765663, 0.26790913939476, -0.26648515462875, 0.2648853957653, -0.26311284303665, 0.26117068529129, -0.25906243920326, 0.25679185986519, -0.25436300039291, 0.25178012251854, -0.24904775619507, 0.24617063999176, -0.24315370619297, 0.24000215530396, -0.23672130703926, 0.23331668972969, -0.22979402542114, 0.22615912556648, -0.22241796553135, 0.21857666969299, -0.21464142203331, 0.21061852574348, -0.20651437342167, 0.20233538746834, -0.19808806478977, 0.19377894699574, -0.18941456079483, 0.18500146269798, -0.18054620921612, 0.17605531215668, -0.17153525352478, 0.16699247062206, -0.16243334114552, 0.15786415338516, -0.15329110622406, 8616.640625, 326.0, 84.0, 0.15004973113537, -0.15460911393166, 0.15916626155376, -0.16371513903141, 0.16824959218502, -0.1727634370327, 0.17725040018559, -0.18170422315598, 0.18611858785152, -0.19048716127872, 0.19480364024639, -0.19906172156334, 0.20325514674187, -0.20737767219543, 0.21142312884331, -0.21538542211056, 0.21925854682922, -0.22303655743599, 0.22671365737915, -0.23028413951397, 0.2337424904108, -0.23708327114582, 0.24030123651028, -0.24339133501053, 0.24634864926338, -0.24916850030422, 0.25184637308121, -0.2543780207634, 0.25675934553146, -0.25898656249046, 0.26105606555939, -0.26296454668045, 0.26470890641212, -0.26628637313843, 0.26769438385963, -0.26893070340157, 0.2699933052063, -0.2708805501461, 0.2715910077095, -0.27212354540825, 0.27247741818428, -0.27265202999115, 0.27264723181725, -0.27246305346489, 0.27209988236427, -0.27155840396881, 0.27083960175514, -0.26994469761848, 0.2688752412796, -0.26763311028481, 0.26622042059898, -0.26463952660561, 0.26289311051369, -0.26098412275314, 0.25891572237015, -0.2566913664341, 0.25431472063065, -0.2517896592617, 0.24912038445473, -0.24631121754646, 0.24336668848991, -0.2402915507555, 0.23709075152874, -0.23376938700676, 0.2303327023983, -0.22678612172604, 0.22313517332077, -0.21938553452492, 0.21554298698902, -0.21161340177059, 0.20760273933411, -0.20351701974869, 0.19936236739159, -0.19514489173889, 0.19087076187134, -0.18654619157314, 0.1821773648262, -0.17777046561241, 0.1733316630125, -0.16886709630489, 0.16438287496567, -0.15988500416279, 0.15537947416306, -0.15087217092514, 8869.126953125, 336.0, 86.0, 0.1521280258894, -0.15658712387085, 0.16104005277157, -0.16548109054565, 0.16990450024605, -0.17430451512337, 0.17867529392242, -0.18301102519035, 0.18730582296848, -0.19155386090279, 0.1957493275404, -0.19988638162613, 0.2039592564106, -0.20796225965023, 0.21188971400261, -0.21573604643345, 0.21949574351311, -0.22316341102123, 0.22673374414444, -0.23020155727863, 0.23356179893017, -0.23680956661701, 0.23994009196758, -0.24294875562191, 0.24583114683628, -0.24858297407627, 0.2512001991272, -0.25367894768715, 0.25601550936699, -0.25820645689964, 0.26024851202965, -0.26213869452477, 0.26387420296669, -0.26545250415802, 0.26687127351761, -0.26812842488289, 0.26922217011452, -0.27015098929405, 0.27091351151466, -0.27150875329971, 0.2719359099865, -0.27219447493553, 0.27228417992592, -0.2722050845623, 0.27195739746094, -0.27154171466827, 0.27095881104469, -0.27020972967148, 0.26929578185081, -0.26821854710579, 0.26697984337807, -0.26558172702789, 0.26402649283409, -0.26231664419174, 0.26045498251915, -0.25844442844391, 0.25628826022148, -0.25398981571198, 0.2515527009964, -0.24898076057434, 0.24627792835236, -0.24344837665558, 0.24049642682076, -0.23742654919624, 0.23424336314201, -0.23095165193081, 0.22755627334118, -0.22406224906445, 0.22047467529774, -0.21679878234863, 0.21303983032703, -0.20920319855213, 0.2052943110466, -0.2013186365366, 0.19728170335293, -0.19318903982639, 0.18904621899128, -0.18485882878304, 0.18063241243362, -0.17637252807617, 0.17208471894264, -0.16777446866035, 0.16344723105431, -0.15910838544369, 0.15476328134537, -0.15041714906693, 9129.0126953125, 346.0, 88.0, 0.15124778449535, -0.1555727571249, 0.1598946005106, -0.16420811414719, 0.16850805282593, -0.17278914153576, 0.17704601585865, -0.18127334117889, 0.18546572327614, -0.18961776793003, 0.19372408092022, -0.19777926802635, 0.20177794992924, -0.20571482181549, 0.20958456397057, -0.21338194608688, 0.21710176765919, -0.22073891758919, 0.22428837418556, -0.22774520516396, 0.23110455274582, -0.23436169326305, 0.23751203715801, -0.24055108428001, 0.24347451329231, -0.24627813696861, 0.24895791709423, -0.25150999426842, 0.25393065810204, -0.2562164068222, 0.25836387276649, -0.2603699862957, 0.2622317969799, -0.26394653320312, 0.26551175117493, -0.26692509651184, 0.26818451285362, -0.26928818225861, 0.27023443579674, -0.27102193236351, 0.27164950966835, -0.27211627364159, 0.27242156863213, -0.27256491780281, 0.27254620194435, -0.27236545085907, 0.27202296257019, -0.27151930332184, 0.2708552479744, -0.27003183960915, 0.26905035972595, -0.26791226863861, 0.26661932468414, -0.2651734650135, 0.26357689499855, -0.26183199882507, 0.25994139909744, -0.25790792703629, 0.25573459267616, -0.25342461466789, 0.25098142027855, -0.24840860068798, 0.24570991098881, -0.24288929998875, 0.2399508357048, -0.23689877986908, 0.23373751342297, -0.23047153651714, 0.22710551321507, -0.22364416718483, 0.22009238600731, -0.21645510196686, 0.21273736655712, -0.20894427597523, 0.20508100092411, -0.20115278661251, 0.19716489315033, -0.19312262535095, 0.18903133273125, -0.18489633500576, 0.18072298169136, -0.17651660740376, 0.17228254675865, -0.16802607476711, 0.1637524664402, -0.15946692228317, 0.1551745980978, -0.15088057518005, 9396.5126953125, 356.0, 90.0, 0.15114872157574, -0.15536342561245, 0.15957362949848, -0.16377453505993, 0.16796134412289, -0.17212918400764, 0.17627316713333, -0.18038836121559, 0.18446984887123, -0.18851271271706, 0.19251200556755, -0.19646282494068, 0.20036028325558, -0.20419952273369, 0.20797571539879, -0.21168410778046, 0.21531996130943, -0.21887865662575, 0.22235560417175, -0.22574631869793, 0.22904640436172, -0.23225156962872, 0.23535761237144, -0.23836046457291, 0.24125617742538, -0.24404092133045, 0.24671100080013, -0.24926291406155, 0.25169321894646, -0.25399872660637, 0.25617635250092, -0.25822320580482, 0.26013651490211, -0.26191380620003, 0.26355263590813, -0.26505088806152, 0.26640659570694, -0.26761791110039, 0.26868325471878, -0.26960128545761, 0.27037081122398, -0.27099081873894, 0.27146059274673, -0.27177953720093, 0.27194735407829, -0.27196383476257, 0.27182912826538, -0.27154347300529, 0.2711073756218, -0.27052155137062, 0.26978689432144, -0.26890453696251, 0.26787576079369, -0.26670214533806, 0.26538532972336, -0.26392728090286, 0.26233005523682, -0.26059591770172, 0.25872740149498, -0.25672706961632, 0.25459772348404, -0.25234240293503, 0.24996416270733, -0.24746629595757, 0.24485225975513, -0.24212558567524, 0.23928998410702, -0.23634926974773, 0.23330737650394, -0.23016837239265, 0.22693639993668, -0.22361570596695, 0.22021062672138, -0.21672557294369, 0.21316502988338, -0.20953354239464, 0.20583571493626, -0.20207619667053, 0.19825966656208, -0.19439083337784, 0.19047445058823, -0.18651524186134, 0.18251796066761, -0.17848737537861, 0.17442817986012, -0.17034512758255, 0.16624286770821, -0.1621260792017, 0.15799935162067, -0.1538672298193, 9671.8515625, 366.0, 94.0, 0.1531607657671, -0.15721154212952, 0.16125831007957, -0.16529679298401, 0.16932265460491, -0.17333151400089, 0.1773189753294, -0.18128064274788, 0.18521206080914, -0.18910878896713, 0.19296641647816, -0.19678051769733, 0.20054666697979, -0.20426048338413, 0.20791763067245, -0.21151378750801, 0.2150446921587, -0.21850614249706, 0.22189399600029, -0.22520415484905, 0.22843262553215, -0.23157550394535, 0.23462894558907, -0.237589225173, 0.24045272171497, -0.24321590363979, 0.2458753734827, -0.24842785298824, 0.2508701980114, -0.25319936871529, 0.2554124891758, -0.25750684738159, 0.25947985053062, -0.26132902503014, 0.26305213570595, -0.26464706659317, 0.2661118209362, -0.26744467020035, 0.26864394545555, -0.26970824599266, 0.27063629031181, -0.2714270055294, 0.27207949757576, -0.27259302139282, 0.27296704053879, -0.27320119738579, 0.27329534292221, -0.27324941754341, 0.27306368947029, -0.27273851633072, 0.27227440476418, -0.27167215943336, 0.27093264460564, -0.27005696296692, 0.26904639601707, -0.26790237426758, 0.26662647724152, -0.26522052288055, 0.26368641853333, -0.2620262503624, 0.26024228334427, -0.25833690166473, 0.25631260871887, -0.25417214632034, 0.25191831588745, -0.24955403804779, 0.24708239734173, -0.2445065677166, 0.24182987213135, -0.23905570805073, 0.23618757724762, -0.23322908580303, 0.23018392920494, -0.22705586254597, 0.22384874522686, -0.22056648135185, 0.21721304953098, -0.21379247307777, 0.21030880510807, -0.20676618814468, 0.2031687349081, -0.19952063262463, 0.19582605361938, -0.192089214921, 0.18831430375576, -0.18450553715229, 0.18066707253456, -0.17680311203003, 0.17291779816151, -0.16901524364948, 0.16509956121445, -0.16117475926876, 0.15724484622478, -0.15331377089024, 9955.2587890625, 377.0, 97.0, -0.15349282324314, 0.15739244222641, -0.16128854453564, 0.16517731547356, -0.1690548658371, 0.17291729152203, -0.17676065862179, 0.18058101832867, -0.18437437713146, 0.1881367713213, -0.19186420738697, 0.19555270671844, -0.19919829070568, 0.2027969956398, -0.20634490251541, 0.20983807742596, -0.21327267587185, 0.2166448533535, -0.21995081007481, 0.22318682074547, -0.22634921967983, 0.22943438589573, -0.23243878781796, 0.23535895347595, -0.23819151520729, 0.24093316495419, -0.2435807287693, 0.24613109230995, -0.24858126044273, 0.25092834234238, -0.25316959619522, 0.25530230998993, -0.25732401013374, 0.25923228263855, -0.26102486252785, 0.2626995742321, -0.26425445079803, 0.26568761467934, -0.26699739694595, 0.26818218827248, -0.26924061775208, 0.27017137408257, -0.27097341418266, 0.27164575457573, -0.27218762040138, 0.27259838581085, -0.27287757396698, 0.27302485704422, -0.27304011583328, 0.27292338013649, -0.27267479896545, 0.27229475975037, -0.27178370952606, 0.27114233374596, -0.27037143707275, 0.26947203278542, -0.26844525337219, 0.26729235053062, -0.26601475477219, 0.26461410522461, -0.26309210062027, 0.26145058870316, -0.25969165563583, 0.25781738758087, -0.25583010911942, 0.25373220443726, -0.2515262067318, 0.24921479821205, -0.24680072069168, 0.24428686499596, -0.24167622625828, 0.23897187411785, -0.23617701232433, 0.23329488933086, -0.23032887279987, 0.2272824048996, -0.22415898740292, 0.22096218168736, -0.21769565343857, 0.21436308324337, -0.21096819639206, 0.2075148075819, -0.204006716609, 0.20044778287411, -0.19684189558029, 0.19319294393063, -0.1895048469305, 0.18578150868416, -0.18202686309814, 0.17824479937553, -0.17443923652172, 0.17061404883862, -0.16677311062813, 0.16292023658752, -0.15905922651291, 0.1551938354969, -0.1513277888298, 10246.969726562, 387.0, 101.0, -0.1501962095499, 0.15402452647686, -0.15785211324692, 0.16167539358139, -0.16549074649811, 0.16929450631142, -0.1730829924345, 0.17685247957706, -0.18059924244881, 0.18431958556175, -0.18800972402096, 0.19166594743729, -0.19528451561928, 0.19886170327663, -0.20239382982254, 0.20587718486786, -0.20930814743042, 0.21268309652805, -0.21599845588207, 0.21925069391727, -0.2224363386631, 0.22555197775364, -0.22859424352646, 0.23155984282494, -0.23444555699825, 0.23724827170372, -0.23996488749981, 0.24259246885777, -0.24512812495232, 0.24756906926632, -0.24991261959076, 0.25215619802475, -0.25429734587669, 0.25633370876312, -0.25826305150986, 0.26008322834969, -0.26179227232933, 0.26338830590248, -0.26486960053444, 0.26623451709747, -0.26748162508011, 0.26860952377319, -0.26961708068848, 0.27050322294235, -0.2712669968605, 0.27190765738487, -0.27242454886436, 0.27281722426414, -0.27308532595634, 0.27322864532471, -0.27324715256691, 0.27314093708992, -0.27291023731232, 0.27255544066429, -0.27207708358765, 0.2714758515358, -0.27075251936913, 0.26990807056427, -0.26894360780716, 0.26786032319069, -0.26665958762169, 0.2653429210186, -0.26391193270683, 0.26236835122108, -0.26071405410767, 0.25895100831985, -0.25708135962486, 0.25510731339455, -0.25303116440773, 0.25085538625717, -0.24858245253563, 0.24621504545212, -0.24375586211681, 0.24120770394802, -0.23857344686985, 0.2358560860157, -0.2330586463213, 0.23018424212933, -0.22723603248596, 0.22421726584435, -0.22113120555878, 0.21798118948936, -0.21477061510086, 0.21150285005569, -0.20818138122559, 0.20480966567993, -0.20139119029045, 0.19792947173119, -0.19442802667618, 0.19089038670063, -0.18732008337975, 0.18372063338757, -0.18009555339813, 0.17644834518433, -0.17278249561787, 0.16910146176815, -0.16540865600109, 0.1617074906826, -0.15800133347511, 0.15429346263409, -0.15058717131615, 10547.229492188, 399.0, 103.0, -0.15202589333057, 0.15570174157619, -0.15937608480453, 0.16304571926594, -0.16670742630959, 0.17035794258118, -0.17399398982525, 0.17761225998402, -0.18120943009853, 0.18478216230869, -0.18832713365555, 0.19184099137783, -0.19532038271427, 0.19876199960709, -0.20216250419617, 0.20551858842373, -0.20882697403431, 0.21208438277245, -0.21528761088848, 0.21843345463276, -0.22151874005795, 0.22454036772251, -0.22749528288841, 0.23038047552109, -0.2331929653883, 0.23592989146709, -0.23858842253685, 0.24116578698158, -0.2436593323946, 0.24606642127037, -0.24838456511497, 0.25061130523682, -0.25274431705475, 0.25478133559227, -0.25672021508217, 0.2585588991642, -0.26029539108276, 0.26192793250084, -0.26345470547676, 0.26487410068512, -0.2661846280098, 0.26738488674164, -0.26847356557846, 0.26944953203201, -0.27031171321869, 0.27105921506882, -0.27169126272202, 0.27220717072487, -0.27260640263557, 0.2728885114193, -0.27305325865746, 0.27310049533844, -0.27303013205528, 0.27284234762192, -0.27253729104996, 0.27211537957191, -0.27157706022263, 0.27092295885086, -0.27015382051468, 0.26927047967911, -0.26827394962311, 0.26716530323029, -0.26594579219818, 0.2646167576313, -0.26317963004112, 0.26163598895073, -0.2599875330925, 0.25823605060577, -0.25638341903687, 0.2544316649437, -0.25238284468651, 0.25023919343948, -0.24800297617912, 0.24567657709122, -0.24326246976852, 0.24076318740845, -0.23818135261536, 0.23551966249943, -0.2327809035778, 0.22996789216995, -0.2270835340023, 0.22413077950478, -0.22111263871193, 0.21803218126297, -0.21489250659943, 0.21169672906399, -0.20844806730747, 0.20514971017838, -0.20180489122868, 0.19841688871384, -0.194988951087, 0.19152437150478, -0.18802645802498, 0.18449848890305, -0.18094378709793, 0.1773656308651, -0.17376728355885, 0.17015205323696, -0.1665231436491, 0.16288381814957, -0.15923725068569, 0.15558660030365, -0.15193501114845, 10856.286132812, 410.0, 107.0, 0.1505690664053, -0.15417824685574, 0.15778689086437, -0.16139198839664, 0.16499046981335, -0.16857931017876, 0.17215538024902, -0.17571561038494, 0.17925684154034, -0.18277597427368, 0.18626983463764, -0.18973532319069, 0.19316928088665, -0.19656857848167, 0.19993011653423, -0.20325076580048, 0.2065274566412, -0.20975713431835, 0.21293675899506, -0.21606335043907, 0.219133913517, -0.22214555740356, 0.22509537637234, -0.22798056900501, 0.23079834878445, -0.23354598879814, 0.23622085154057, -0.23882031440735, 0.24134185910225, -0.24378302693367, 0.24614144861698, -0.2484148144722, 0.25060087442398, -0.2526975274086, 0.25470268726349, -0.25661444664001, 0.25843086838722, -0.26015019416809, 0.26177075505257, -0.26329100131989, 0.26470944285393, -0.26602467894554, 0.26723545789719, -0.26834064722061, 0.26933920383453, -0.27023014426231, 0.27101266384125, -0.27168607711792, 0.27224975824356, -0.27270320057869, 0.27304610610008, -0.27327814698219, 0.27339923381805, -0.27340930700302, 0.27330845594406, -0.27309694886208, 0.27277505397797, -0.27234318852425, 0.27180197834969, -0.27115198969841, 0.27039408683777, -0.26952907443047, 0.26855799555779, -0.26748189330101, 0.26630201935768, -0.26501965522766, 0.26363623142242, -0.26215317845345, 0.26057216525078, -0.25889486074448, 0.25712305307388, -0.25525861978531, 0.25330349802971, -0.25125974416733, 0.24912948906422, -0.24691490828991, 0.24461826682091, -0.24224191904068, 0.23978827893734, -0.23725979030132, 0.23465900123119, -0.23198847472668, 0.22925087809563, -0.22644886374474, 0.22358517348766, -0.22066257894039, 0.21768388152122, -0.21465191245079, 0.2115695476532, -0.20843966305256, 0.20526519417763, -0.20204904675484, 0.19879418611526, -0.19550354778767, 0.19218008220196, -0.18882676959038, 0.18544654548168, -0.18204237520695, 0.17861717939377, -0.1751738935709, 0.17171542346478, -0.16824465990067, 0.16476446390152, -0.1612776517868, 0.15778703987598, -0.15429539978504, 0.15080545842648, 11174.400390625, 422.0, 110.0, 0.15020936727524, -0.15366150438786, 0.15711407363415, -0.16056445240974, 0.16400995850563, -0.16744790971279, 0.17087560892105, -0.17429032921791, 0.17768931388855, -0.18106979131699, 0.18442901968956, -0.18776419758797, 0.19107256829739, -0.19435134530067, 0.19759775698185, -0.20080903172493, 0.20398241281509, -0.20711517333984, 0.21020457148552, -0.21324792504311, 0.21624253690243, -0.21918576955795, 0.22207501530647, -0.22490765154362, 0.22768117487431, -0.2303930670023, 0.23304086923599, -0.23562215268612, 0.23813459277153, -0.24057585000992, 0.24294370412827, -0.24523594975471, 0.24745045602322, -0.24958518147469, 0.25163811445236, -0.25360736250877, 0.25549107789993, -0.25728744268417, 0.25899481773376, -0.2606115937233, 0.26213619112968, -0.26356720924377, 0.26490330696106, -0.26614317297935, 0.26728567481041, -0.26832967996597, 0.26927423477173, -0.270118445158, 0.2708615064621, -0.27150267362595, 0.27204141020775, -0.27247714996338, 0.27280950546265, -0.27303817868233, 0.27316296100616, -0.27318376302719, 0.27310052514076, -0.27291339635849, 0.27262255549431, -0.27222827076912, 0.27173098921776, -0.27113115787506, 0.27042937278748, -0.26962637901306, 0.26872289180756, -0.26771983504295, 0.26661816239357, -0.26541897654533, 0.2641234099865, -0.26273274421692, 0.26124829053879, -0.25967147946358, 0.25800383090973, -0.25624692440033, 0.25440245866776, -0.25247213244438, 0.25045785307884, -0.2483614385128, 0.24618491530418, -0.24393029510975, 0.24159969389439, -0.23919527232647, 0.23671925067902, -0.23417392373085, 0.23156161606312, -0.22888471186161, 0.22614566981792, -0.2233469337225, 0.22049103677273, -0.21758054196835, 0.21461802721024, -0.21160613000393, 0.20854748785496, -0.20544476807117, 0.20230068266392, -0.19911794364452, 0.19589926302433, -0.19264739751816, 0.18936507403851, -0.18605503439903, 0.18272006511688, -0.17936286330223, 0.17598621547222, -0.17259281873703, 0.16918541491032, -0.1657666862011, 0.16233932971954, -0.15890599787235, 0.15546932816505, -0.15203192830086, 11501.834960938, 436.0, 110.0, 0.15048104524612, -0.15391863882542, 0.1573564261198, -0.16079181432724, 0.16422219574451, -0.16764491796494, 0.17105729877949, -0.17445668578148, 0.17784033715725, -0.18120554089546, 0.18454958498478, -0.18786972761154, 0.19116321206093, -0.19442729651928, 0.19765926897526, -0.20085637271404, 0.20401588082314, -0.20713509619236, 0.2102113366127, -0.21324189007282, 0.21622413396835, -0.21915543079376, 0.22203320264816, -0.22485485672951, 0.22761788964272, -0.23031979799271, 0.23295815289021, -0.2355305403471, 0.23803463578224, -0.24046811461449, 0.24282875657082, -0.24511437118053, 0.24732282757759, -0.2494520843029, 0.25150012969971, -0.25346505641937, 0.25534501671791, -0.25713822245598, 0.25884300470352, -0.26045769453049, 0.26198077201843, -0.26341080665588, 0.26474639773369, -0.26598629355431, 0.26712927222252, -0.2681742310524, 0.26912018656731, -0.26996621489525, 0.2707114815712, -0.27135524153709, 0.27189689874649, -0.27233591675758, 0.27267184853554, -0.27290439605713, 0.27303329110146, -0.27305838465691, 0.27297967672348, -0.27279725670815, 0.27251124382019, -0.27212190628052, 0.27162966132164, -0.27103492617607, 0.27033829689026, -0.2695404291153, 0.26864206790924, -0.26764410734177, 0.26654747128487, -0.2653531730175, 0.26406243443489, -0.26267641782761, 0.26119646430016, -0.25962397456169, 0.25796043872833, -0.25620743632317, 0.25436660647392, -0.25243970751762, 0.25042855739594, -0.24833500385284, 0.24616104364395, -0.24390868842602, 0.24158002436161, -0.2391772121191, 0.23670248687267, -0.23415811359882, 0.23154643177986, -0.22886981070042, 0.22613070905209, -0.22333157062531, 0.2204749584198, -0.21756339073181, 0.21459949016571, -0.21158587932587, 0.20852522552013, -0.20542019605637, 0.2022735029459, -0.19908787310123, 0.19586604833603, -0.1926107853651, 0.18932482600212, -0.18601094186306, 0.18267191946507, -0.1793105006218, 0.1759294718504, -0.1725315451622, 0.16911949217319, -0.16569603979588, 0.16226387023926, -0.15882566571236, 0.15538412332535, -0.15194183588028, 11838.864257812, 448.0, 115.0, 0.15033860504627, -0.15367311239243, 0.15700601041317, -0.16033497452736, 0.16365760564804, -0.16697151958942, 0.17027431726456, -0.17356356978416, 0.17683683335781, -0.18009169399738, 0.18332570791245, -0.1865364164114, 0.18972140550613, -0.19287821650505, 0.19600442051888, -0.19909760355949, 0.20215536653996, -0.20517528057098, 0.20815500617027, -0.21109217405319, 0.21398444473743, -0.21682952344418, 0.21962511539459, -0.22236898541451, 0.2250589132309, -0.22769272327423, 0.23026828467846, -0.23278348147869, 0.23523625731468, -0.23762461543083, 0.23994658887386, -0.24220027029514, 0.24438379704952, -0.2464953660965, 0.24853324890137, -0.2504957318306, 0.25238120555878, -0.25418812036514, 0.25591492652893, -0.25756025314331, 0.25912269949913, -0.26060101389885, 0.26199391484261, -0.26330026984215, 0.26451903581619, -0.26564916968346, 0.26668977737427, -0.26763999462128, 0.26849907636642, -0.26926627755165, 0.26994103193283, -0.27052280306816, 0.27101114392281, -0.27140566706657, 0.27170610427856, -0.27191224694252, 0.27202397584915, -0.27204123139381, 0.27196407318115, -0.27179265022278, 0.2715271115303, -0.27116778492928, 0.27071502804756, -0.27016928792, 0.26953110098839, -0.26880106329918, 0.26797989010811, -0.26706829667091, 0.26606714725494, -0.26497739553452, 0.26379996538162, -0.26253595948219, 0.26118648052216, -0.25975278019905, 0.2582360804081, -0.25663775205612, 0.25495919585228, -0.25320187211037, 0.25136730074883, -0.2494570761919, 0.24747285246849, -0.24541631340981, 0.24328924715519, -0.24109342694283, 0.23883073031902, -0.23650304973125, 0.23411233723164, -0.23166058957577, 0.22914983332157, -0.22658213973045, 0.22395960986614, -0.22128438949585, 0.21855862438679, -0.21578453481197, 0.21296432614326, -0.210100248456, 0.20719456672668, -0.20424956083298, 0.2012675255537, -0.19825077056885, 0.1952016055584, -0.19212238490582, 0.18901541829109, -0.18588304519653, 0.18272759020329, -0.17955139279366, 0.17635677754879, -0.17314606904984, 0.16992157697678, -0.16668558120728, 0.163440361619, -0.1601881980896, 0.15693131089211, -0.15367195010185, 0.15041230618954, 12185.76953125, 462.0, 117.0, 0.15211391448975, -0.15533469617367, 0.15855494141579, -0.16177251935005, 0.16498526930809, -0.16819098591805, 0.17138749361038, -0.17457257211208, 0.17774398624897, -0.1808994859457, 0.1840368360281, -0.18715378642082, 0.19024807214737, -0.19331742823124, 0.19635960459709, -0.19937235116959, 0.20235340297222, -0.20530052483082, 0.2082114815712, -0.2110840678215, 0.21391607820988, -0.21670532226562, 0.21944965422153, -0.22214691340923, 0.22479499876499, -0.2273918390274, 0.22993534803391, -0.23242351412773, 0.23485435545444, -0.23722591996193, 0.23953630030155, -0.241783618927, 0.24396604299545, -0.24608179926872, 0.24812915921211, -0.25010645389557, 0.25201201438904, -0.25384429097176, 0.2556017935276, -0.25728300213814, 0.25888651609421, -0.26041105389595, 0.26185527443886, -0.26321801543236, 0.26449808478355, -0.26569437980652, 0.26680594682693, -0.26783183217049, 0.26877111196518, -0.26962304115295, 0.27038684487343, -0.27106189727783, 0.27164760231972, -0.2721434533596, 0.27254903316498, -0.27286398410797, 0.27308800816536, -0.27322092652321, 0.27326259016991, -0.27321299910545, 0.27307215332985, -0.27284017205238, 0.27251723408699, -0.27210360765457, 0.27159962058067, -0.27100571990013, 0.27032241225243, -0.26955020427704, 0.26868981122971, -0.26774191856384, 0.26670730113983, -0.26558685302734, 0.26438149809837, -0.26309224963188, 0.2617202103138, -0.26026645302773, 0.25873225927353, -0.25711885094643, 0.25542759895325, -0.25365990400314, 0.25181722640991, -0.24990105628967, 0.247913017869, -0.24585470557213, 0.24372783303261, -0.24153411388397, 0.23927535116673, -0.23695336282253, 0.23457004129887, -0.23212729394436, 0.22962708771229, -0.22707143425941, 0.2244623452425, -0.22180192172527, 0.21909223496914, -0.21633541584015, 0.21353363990784, -0.21068908274174, 0.20780393481255, -0.20488043129444, 0.20192079246044, -0.19892728328705, 0.1959021538496, -0.19284769892693, 0.18976618349552, -0.18665988743305, 0.18353109061718, -0.18038210272789, 0.17721517384052, -0.1740325987339, 0.17083662748337, -0.16762952506542, 0.1644135415554, -0.16119088232517, 0.1579637825489, -0.15473441779613, 0.15150494873524, 12542.83984375, 474.0, 123.0, 0.15018929541111, -0.15333200991154, 0.15647387504578, -0.15961292386055, 0.16274717450142, -0.1658745855093, 0.16899317502975, -0.17210088670254, 0.17519569396973, -0.1782755702734, 0.18133844435215, -0.18438227474689, 0.18740500509739, -0.19040460884571, 0.19337901473045, -0.19632621109486, 0.19924414157867, -0.20213080942631, 0.204984202981, -0.20780231058598, 0.21058316528797, -0.21332481503487, 0.21602530777454, -0.21868275105953, 0.22129522264004, -0.22386087477207, 0.22637787461281, -0.22884438931942, 0.23125866055489, -0.23361895978451, 0.23592355847359, -0.23817078769207, 0.24035902321339, -0.24248667061329, 0.24455219507217, -0.24655409157276, 0.24849088490009, -0.25036117434502, 0.25216361880302, -0.25389686226845, 0.25555968284607, -0.25715085864067, 0.25866922736168, -0.26011368632317, 0.26148319244385, -0.26277676224709, 0.26399350166321, -0.26513248682022, 0.26619291305542, -0.26717403531075, 0.2680751979351, -0.2688957452774, 0.26963514089584, -0.2702928185463, 0.27086842060089, -0.2713615000248, 0.27177178859711, -0.27209904789925, 0.27234309911728, -0.27250379323959, 0.27258107066154, -0.27257499098778, 0.27248564362526, -0.27231308817863, 0.27205762267113, -0.27171945571899, 0.2712989449501, -0.27079647779465, 0.27021250128746, -0.26954758167267, 0.26880225539207, -0.26797717809677, 0.2670730650425, -0.26609066128731, 0.26503077149391, -0.26389428973198, 0.2626821398735, -0.26139530539513, 0.26003482937813, -0.25860181450844, 0.25709736347198, -0.25552272796631, 0.2538791000843, -0.25216776132584, 0.25039008259773, -0.24854741990566, 0.2466412037611, -0.24467286467552, 0.24264393746853, -0.24055594205856, 0.23841045796871, -0.23620907962322, 0.23395347595215, -0.23164528608322, 0.22928623855114, -0.22687804698944, 0.22442245483398, -0.22192126512527, 0.21937625110149, -0.21678924560547, 0.21416209638119, -0.21149663627148, 0.20879474282265, -0.20605829358101, 0.20328918099403, -0.20048929750919, 0.19766056537628, -0.19480487704277, 0.19192415475845, -0.18902032077312, 0.18609528243542, -0.18315094709396, 0.1801892220974, -0.17721202969551, 0.17422123253345, -0.17121873795986, 0.16820642352104, -0.16518612205982, 0.16215971112251, -0.15912899374962, 0.1560957878828, -0.15306188166142, 0.15002906322479, 12910.373046875, 489.0, 125.0, -0.15293352305889, 0.1559337079525, -0.15893325209618, 0.16193044185638, -0.16492348909378, 0.16791066527367, -0.17089015245438, 0.17386019229889, -0.17681893706322, 0.17976461350918, -0.18269538879395, 0.18560943007469, -0.18850490450859, 0.19137999415398, -0.19423286616802, 0.1970616877079, -0.19986462593079, 0.20263984799385, -0.20538556575775, 0.20809996128082, -0.2107812166214, 0.21342757344246, -0.21603724360466, 0.21860846877098, -0.22113950550556, 0.22362864017487, -0.22607417404652, 0.22847440838814, -0.230827704072, 0.23313242197037, -0.235386967659, 0.23758974671364, -0.23973922431469, 0.24183388054371, -0.2438722550869, 0.2458528727293, -0.24777433276176, 0.24963526427746, -0.25143432617188, 0.25317025184631, -0.25484174489975, 0.25644764304161, -0.257986754179, 0.25945794582367, -0.26086017489433, 0.26219239830971, -0.26345363259315, 0.264642983675, -0.26575952768326, 0.26680245995522, -0.26777103543282, 0.26866447925568, -0.26948219537735, 0.27022349834442, -0.27088791131973, 0.27147486805916, -0.27198395133018, 0.27241477370262, -0.27276700735092, 0.27304038405418, -0.27323469519615, 0.27334976196289, -0.27338552474976, 0.2733419239521, -0.27321898937225, 0.27301678061485, -0.27273544669151, 0.27237522602081, -0.27193629741669, 0.27141904830933, -0.27082380652428, 0.27015098929405, -0.26940110325813, 0.26857471466064, -0.26767235994339, 0.26669472455978, -0.26564255356789, 0.26451653242111, -0.26331752538681, 0.26204639673233, -0.26070404052734, 0.25929141044617, -0.25780957937241, 0.25625959038734, -0.25464254617691, 0.25295960903168, -0.25121197104454, 0.24940091371536, -0.24752768874168, 0.24559366703033, -0.24360020458698, 0.24154870212078, -0.23944060504436, 0.23727741837502, -0.23506064713001, 0.23279184103012, -0.23047259449959, 0.22810450196266, -0.22568920254707, 0.22322836518288, -0.22072367370129, 0.218176856637, -0.21558964252472, 0.2129637748003, -0.21030104160309, 0.20760321617126, -0.20487208664417, 0.2021095007658, -0.19931726157665, 0.19649721682072, -0.19365119934082, 0.19078104197979, -0.1878886371851, 0.18497578799725, -0.18204438686371, 0.17909626662731, -0.17613327503204, 0.17315725982189, -0.17017006874084, 0.16717351973057, -0.16416943073273, 0.16115960478783, -0.15814584493637, 0.1551299393177, -0.15211363136768, 13288.67578125, 502.0, 131.0, 0.15187075734138, -0.15482072532177, 0.15777017176151, -0.16071742773056, 0.16366085410118, -0.166598752141, 0.1695294380188, -0.17245124280453, 0.17536243796349, -0.1782613247633, 0.18114618957043, -0.1840153336525, 0.18686702847481, -0.18969954550266, 0.19251120090485, -0.1953002512455, 0.19806499779224, -0.20080375671387, 0.20351481437683, -0.20619650185108, 0.20884715020657, -0.21146507561207, 0.21404865384102, -0.21659626066685, 0.21910627186298, -0.22157707810402, 0.22400712966919, -0.22639487683773, 0.22873875498772, -0.23103730380535, 0.23328900337219, -0.23549242317677, 0.23764614760876, -0.23974876105785, 0.24179890751839, -0.24379527568817, 0.24573653936386, -0.24762146174908, 0.24944879114628, -0.25121736526489, 0.25292602181435, -0.25457367300987, 0.25615921616554, -0.25768160820007, 0.25913992524147, -0.2605331838131, 0.26186046004295, -0.26312094926834, 0.26431384682655, -0.26543834805489, 0.2664937376976, -0.26747938990593, 0.2683946788311, -0.26923900842667, 0.27001187205315, -0.27071279287338, 0.27134138345718, -0.27189722657204, 0.27238002419472, -0.27278950810432, 0.2731254696846, -0.27338773012161, 0.27357620000839, -0.27369076013565, 0.27373147010803, -0.27369832992554, 0.27359145879745, -0.27341097593307, 0.27315706014633, -0.27283000946045, 0.27243006229401, -0.27195757627487, 0.27141299843788, -0.2707966864109, 0.27010920643806, -0.26935106515884, 0.26852282881737, -0.26762518286705, 0.26665878295898, -0.26562431454659, 0.26452261209488, -0.26335445046425, 0.26212069392204, -0.26082223653793, 0.25946003198624, -0.25803506374359, 0.25654831528664, -0.25500085949898, 0.25339376926422, -0.25172823667526, 0.25000536441803, -0.24822635948658, 0.24639245867729, -0.24450491368771, 0.24256502091885, -0.2405740916729, 0.23853348195553, -0.23644454777241, 0.23430870473385, -0.23212733864784, 0.22990190982819, -0.22763387858868, 0.22532472014427, -0.22297592461109, 0.22058902680874, -0.21816551685333, 0.21570697426796, -0.21321493387222, 0.21069096028805, -0.20813661813736, 0.20555350184441, -0.20294319093227, 0.20030727982521, -0.1976473480463, 0.19496501982212, -0.19226185977459, 0.18953949213028, -0.18679948151112, 0.18404345214367, -0.1812729537487, 0.17848959565163, -0.1756949275732, 0.17289051413536, -0.17007791996002, 0.16725867986679, -0.16443431377411, 0.16160634160042, -0.158776268363, 0.15594555437565, -0.15311568975449, 0.15028810501099, 13678.063476562, 518.0, 132.0, 0.15130592882633, -0.15418338775635, 0.1570592969656, -0.15993213653564, 0.16280041635036, -0.16566257178783, 0.16851705312729, -0.17136232554913, 0.17419683933258, -0.17701900005341, 0.179827272892, -0.18262007832527, 0.18539583683014, -0.18815298378468, 0.19088995456696, -0.19360518455505, 0.19629712402821, -0.19896419346333, 0.20160485804081, -0.20421758294106, 0.2068008184433, -0.20935305953026, 0.21187280118465, -0.21435853838921, 0.21680878102779, -0.21922209858894, 0.22159700095654, -0.22393208742142, 0.22622594237328, -0.22847718000412, 0.23068441450596, -0.23284631967545, 0.23496156930923, -0.23702888190746, 0.23904697597027, -0.24101459980011, 0.24293056130409, -0.24479368329048, 0.2466028034687, -0.24835680425167, 0.25005459785461, -0.25169512629509, 0.2532773911953, -0.2548004090786, 0.25626319646835, -0.25766488909721, 0.25900459289551, -0.26028147339821, 0.26149475574493, -0.2626436650753, 0.2637275159359, -0.26474559307098, 0.26569733023643, -0.26658210158348, 0.267399340868, -0.26814860105515, 0.26882940530777, -0.26944130659103, 0.26998400688171, -0.27045711874962, 0.27086040377617, -0.27119359374046, 0.27145653963089, -0.27164906263351, 0.27177110314369, -0.27182260155678, 0.27180355787277, -0.27171397209167, 0.27155396342278, -0.27132368087769, 0.27102327346802, -0.27065297961235, 0.27021303772926, -0.26970380544662, 0.26912561058998, -0.26847884058952, 0.26776400208473, -0.26698151230812, 0.26613190770149, -0.26521581411362, 0.2642337679863, -0.26318651437759, 0.26207467913628, -0.2608990073204, 0.25966027379036, -0.25835931301117, 0.25699695944786, -0.2555741071701, 0.25409165024757, -0.25255060195923, 0.25095188617706, -0.24929657578468, 0.24758569896221, -0.24582037329674, 0.24400168657303, -0.24213080108166, 0.24020890891552, -0.23823718726635, 0.23621688783169, -0.23414926230907, 0.23203559219837, -0.22987715899944, 0.22767531871796, -0.22543139755726, 0.22314676642418, -0.22082281112671, 0.218460932374, -0.21606253087521, 0.21362906694412, -0.21116195619106, 0.20866267383099, -0.20613269507885, 0.20357348024845, -0.20098651945591, 0.19837331771851, -0.19573536515236, 0.19307416677475, -0.19039124250412, 0.18768809735775, -0.18496623635292, 0.18222717940807, -0.17947244644165, 0.17670352756977, -0.17392194271088, 0.17112918198109, -0.16832675039768, 0.16551613807678, -0.16269880533218, 0.15987622737885, -0.15704987943172, 0.15422120690346, -0.15139162540436, 14078.861328125, 534.0, 135.0, 0.15270428359509, -0.15548291802406, 0.15826171636581, -0.16103930771351, 0.16381430625916, -0.16658529639244, 0.16935089230537, -0.17210963368416, 0.17486011981964, -0.17760089039803, 0.18033050000668, -0.18304748833179, 0.18575040996075, -0.18843778967857, 0.19110815227032, -0.19376005232334, 0.19639201462269, -0.1990025639534, 0.20159024000168, -0.20415358245373, 0.20669114589691, -0.20920145511627, 0.21168307960033, -0.21413458883762, 0.21655455231667, -0.21894156932831, 0.22129420936108, -0.22361108660698, 0.22589084506035, -0.22813211381435, 0.23033353686333, -0.23249380290508, 0.23461160063744, -0.23668564856052, 0.23871466517448, -0.24069741368294, 0.24263268709183, -0.24451926350594, 0.24635599553585, -0.24814173579216, 0.24987535178661, -0.2515557706356, 0.25318193435669, -0.25475281476974, 0.25626742839813, -0.25772479176521, 0.25912398099899, -0.26046407222748, 0.26174426078796, -0.2629636824131, 0.26412156224251, -0.26521715521812, 0.26624974608421, -0.26721861958504, 0.26812320947647, -0.26896286010742, 0.26973703503609, -0.27044522762299, 0.27108699083328, -0.27166184782982, 0.2721694111824, -0.27260935306549, 0.27298137545586, -0.2732852101326, 0.27352064847946, -0.27368751168251, 0.27378568053246, -0.27381506562233, 0.27377560734749, -0.27366733551025, 0.27349027991295, -0.27324455976486, 0.27293029427528, -0.27254766225815, 0.27209690213203, -0.27157828211784, 0.2709921002388, -0.27033874392509, 0.2696185708046, -0.26883205771446, 0.26797968149185, -0.26706197857857, 0.26607948541641, -0.26503285765648, 0.26392269134521, -0.26274973154068, 0.26151466369629, -0.26021829247475, 0.25886142253876, -0.25744485855103, 0.25596949458122, -0.25443628430367, 0.25284612178802, -0.25120005011559, 0.24949905276299, -0.24774418771267, 0.2459365427494, -0.24407722055912, 0.24216736853123, -0.24020816385746, 0.23820081353188, -0.23614652454853, 0.23404656350613, -0.2319021821022, 0.22971470654011, -0.22748544812202, 0.2252157330513, -0.22290694713593, 0.22056046128273, -0.21817767620087, 0.21575999259949, -0.21330884099007, 0.2108256816864, -0.20831194519997, 0.20576912164688, -0.20319867134094, 0.20060208439827, -0.19798085093498, 0.1953364610672, -0.19267043471336, 0.18998427689075, -0.18727949261665, 0.18455758690834, -0.18182007968426, 0.17906847596169, -0.17630429565907, 0.17352901399136, -0.170744150877, 0.16795118153095, -0.1651516109705, 0.16234689950943, -0.15953852236271, 0.15672792494297, -0.15391655266285, 0.15110583603382, 14491.404296875, 547.0, 143.0, -0.15004363656044, 0.15276078879833, -0.15547785162926, 0.15819355845451, -0.16090662777424, 0.16361573338509, -0.16631960868835, 0.16901691257954, -0.17170634865761, 0.17438659071922, -0.17705631256104, 0.1797141879797, -0.18235889077187, 0.18498907983303, -0.18760344386101, 0.19020064175129, -0.19277933239937, 0.19533823430538, -0.19787599146366, 0.20039130747318, -0.20288288593292, 0.20534940063953, -0.20778958499432, 0.21020214259624, -0.21258582174778, 0.2149393260479, -0.21726144850254, 0.21955093741417, -0.22180657088757, 0.22402714192867, -0.2262114584446, 0.22835837304592, -0.23046670854092, 0.23253533244133, -0.23456314206123, 0.23654901981354, -0.23849192261696, 0.24039079248905, -0.24224458634853, 0.2440523058176, -0.24581298232079, 0.2475256472826, -0.24918937683105, 0.25080329179764, -0.25236648321152, 0.25387814640999, -0.25533744692802, 0.25674358010292, -0.25809580087662, 0.25939339399338, -0.26063567399979, 0.26182195544243, -0.26295161247253, 0.26402404904366, -0.26503872871399, 0.26599505543709, -0.26689261198044, 0.26773086190224, -0.26850944757462, 0.26922792196274, -0.26988592743874, 0.27048316597939, -0.27101933956146, 0.27149420976639, -0.27190756797791, 0.27225920557976, -0.27254897356033, 0.27277678251266, -0.27294257283211, 0.27304631471634, -0.27308797836304, 0.27306759357452, -0.27298527956009, 0.2728411257267, -0.27263525128365, 0.27236789464951, -0.27203920483589, 0.27164947986603, -0.27119898796082, 0.27068802714348, -0.27011701464653, 0.26948627829552, -0.26879626512527, 0.26804742217064, -0.26724022626877, 0.26637521386147, -0.26545295119286, 0.26447400450706, -0.26343896985054, 0.26234850287437, -0.26120328903198, 0.2600040435791, -0.25875142216682, 0.25744625926018, -0.25608932971954, 0.2546814084053, -0.25322332978249, 0.25171598792076, -0.2501602768898, 0.24855706095695, -0.24690729379654, 0.24521194398403, -0.24347196519375, 0.24168835580349, -0.23986212909222, 0.23799432814121, -0.2360859811306, 0.23413819074631, -0.23215200006962, 0.23012854158878, -0.22806890308857, 0.22597421705723, -0.22384563088417, 0.22168429195881, -0.21949136257172, 0.2172679901123, -0.21501539647579, 0.21273472905159, -0.21042720973492, 0.20809403061867, -0.20573638379574, 0.20335550606251, -0.20095258951187, 0.19852885603905, -0.19608552753925, 0.19362382590771, -0.19114497303963, 0.18865016102791, -0.18614062666893, 0.18361759185791, -0.18108224868774, 0.17853580415249, -0.1759794652462, 0.17341440916061, -0.17084184288979, 0.16826294362545, -0.16567887365818, 0.16309079527855, -0.16049987077713, 0.15790721774101, -0.15531399846077, 0.15272130072117, -0.15013022720814, 14916.034179688, 563.0, 148.0, -0.15027585625648, 0.1528217792511, -0.15536873042583, 0.15791569650173, -0.16046157479286, 0.16300532221794, -0.16554586589336, 0.16808207333088, -0.1706129014492, 0.17313720285892, -0.17565390467644, 0.17816187441349, -0.18065999448299, 0.1831471323967, -0.18562220036983, 0.18808403611183, -0.1905315220356, 0.19296352565289, -0.1953789293766, 0.1977766007185, -0.20015540719032, 0.20251421630383, -0.20485192537308, 0.20716741681099, -0.20945955812931, 0.21172724664211, -0.21396940946579, 0.21618491411209, -0.21837270259857, 0.22053168714046, -0.22266079485416, 0.22475896775723, -0.22682516276836, 0.22885835170746, -0.23085749149323, 0.23282158374786, -0.23474963009357, 0.23664064705372, -0.23849368095398, 0.24030776321888, -0.24208195507526, 0.24381536245346, -0.24550706148148, 0.24715618789196, -0.24876187741756, 0.25032329559326, -0.25183960795403, 0.25331002473831, -0.25473374128342, 0.2561100423336, -0.25743818283081, 0.2587174475193, -0.25994715094566, 0.2611266374588, -0.26225528120995, 0.26333245635033, -0.26435759663582, 0.26533010601997, -0.26624950766563, 0.267115265131, -0.2679269015789, 0.26868396997452, -0.26938608288765, 0.27003279328346, -0.27062380313873, 0.27115875482559, -0.27163732051849, 0.27205926179886, -0.27242431044579, 0.27273228764534, -0.27298298478127, 0.27317625284195, -0.27331194281578, 0.27339002490044, -0.27341040968895, 0.27337309718132, -0.2732780277729, 0.27312526106834, -0.27291488647461, 0.27264699339867, -0.2723217010498, 0.27193915843964, -0.2714995443821, 0.27100309729576, -0.27045005559921, 0.26984071731567, -0.26917535066605, 0.26845434308052, -0.26767802238464, 0.26684680581093, -0.26596111059189, 0.26502141356468, -0.26402819156647, 0.2629819214344, -0.26188316941261, 0.26073253154755, -0.25953054428101, 0.25827786326408, -0.25697511434555, 0.25562298297882, -0.25422215461731, 0.25277337431908, -0.25127735733986, 0.2497348934412, -0.24814677238464, 0.24651378393173, -0.24483677744865, 0.24311663210392, -0.24135418236256, 0.23955035209656, -0.23770605027676, 0.23582223057747, -0.23389980196953, 0.2319397777319, -0.22994312644005, 0.22791083157063, -0.22584395110607, 0.22374348342419, -0.22161048650742, 0.21944600343704, -0.21725112199783, 0.21502692997456, -0.21277448534966, 0.21049493551254, -0.20818935334682, 0.20585887134075, -0.20350462198257, 0.20112772285938, -0.19872932136059, 0.19631057977676, -0.193872615695, 0.19141659140587, -0.18894366919994, 0.18645499646664, -0.18395175039768, 0.18143504858017, -0.17890609800816, 0.17636601626873, -0.17381596565247, 0.17125710844994, -0.16869059205055, 0.16611754894257, -0.16353912651539, 0.16095645725727, -0.15837064385414, 0.15578284859657, -0.15319412946701, 0.15060563385487, 15353.107421875, 582.0, 147.0, 0.15062014758587, -0.15318211913109, 0.15574571490288, -0.15830984711647, 0.16087344288826, -0.16343539953232, 0.16599461436272, -0.16854998469353, 0.1711003780365, -0.17364467680454, 0.17618173360825, -0.17871041595936, 0.18122957646847, -0.18373803794384, 0.18623468279839, -0.18871831893921, 0.1911877989769, -0.19364197552204, 0.19607964158058, -0.19849966466427, 0.20090088248253, -0.20328210294247, 0.20564220845699, -0.20798000693321, 0.21029436588287, -0.21258413791656, 0.21484816074371, -0.21708531677723, 0.21929448843002, -0.22147454321384, 0.2236243635416, -0.22574286162853, 0.22782894968987, -0.22988153994083, 0.23189957439899, -0.2338819950819, 0.23582777380943, -0.23773586750031, 0.23960529267788, -0.24143505096436, 0.24322415888309, -0.24497166275978, 0.24667662382126, -0.24833813309669, 0.24995528161526, -0.25152719020844, 0.25305300951004, -0.25453189015388, 0.25596305727959, -0.25734567642212, 0.25867903232574, -0.25996232032776, 0.26119488477707, -0.26237601041794, 0.2635050714016, -0.26458135247231, 0.26560431718826, -0.26657336950302, 0.26748794317245, -0.26834753155708, 0.26915165781975, -0.26989978551865, 0.27059155702591, -0.27122655510902, 0.27180436253548, -0.27232471108437, 0.2727872133255, -0.2731916308403, 0.27353772521019, -0.27382528781891, 0.2740541100502, -0.27422404289246, 0.27433499693871, -0.27438685297966, 0.274379581213, -0.27431318163872, 0.2741876244545, -0.27400299906731, 0.27375936508179, -0.27345684170723, 0.27309557795525, -0.27267575263977, 0.27219757437706, -0.27166128158569, 0.27106717228889, -0.27041554450989, 0.26970675587654, -0.2689411342144, 0.2681191265583, -0.26724115014076, 0.26630765199661, -0.26531919836998, 0.2642762362957, -0.26317936182022, 0.26202917098999, -0.26082625985146, 0.25957128405571, -0.25826489925385, 0.2569078207016, -0.25550076365471, 0.25404447317123, -0.25253975391388, 0.25098738074303, -0.2493881881237, 0.24774304032326, -0.24605280160904, 0.24431836605072, -0.24254065752029, 0.24072062969208, -0.23885922133923, 0.23695743083954, -0.23501625657082, 0.23303669691086, -0.23101980984211, 0.22896665334702, -0.22687827050686, 0.22475576400757, -0.22260022163391, 0.22041276097298, -0.21819449961185, 0.21594658493996, -0.21367016434669, 0.21136638522148, -0.20903640985489, 0.20668143033981, -0.20430262386799, 0.20190116763115, -0.19947826862335, 0.19703511893749, -0.19457292556763, 0.19209288060665, -0.18959622085094, 0.18708415329456, -0.18455785512924, 0.18201857805252, -0.17946749925613, 0.1769058406353, -0.17433480918407, 0.17175559699535, -0.16916939616203, 0.16657741367817, -0.16398081183434, 0.16138078272343, -0.15877847373486, 0.15617506206036, -0.15357169508934, 0.15096950531006, 15802.98828125, 597.0, 155.0, -0.1515347212553, 0.15402890741825, -0.1565223634243, 0.15901410579681, -0.16150312125683, 0.16398844122887, -0.16646902263165, 0.16894388198853, -0.17141197621822, 0.17387229204178, -0.17632381618023, 0.17876550555229, -0.18119636178017, 0.18361532688141, -0.18602140247822, 0.18841356039047, -0.19079075753689, 0.19315199553967, -0.19549623131752, 0.19782246649265, -0.20012970268726, 0.20241689682007, -0.20468308031559, 0.20692723989487, -0.20914840698242, 0.21134556829929, -0.21351778507233, 0.21566407382488, -0.21778348088264, 0.21987506747246, -0.22193789482117, 0.22397105395794, -0.22597360610962, 0.22794465720654, -0.22988334298134, 0.23178876936436, -0.2336600869894, 0.23549644649029, -0.23729701340199, 0.23906098306179, -0.240787550807, 0.24247594177723, -0.24412539601326, 0.24573515355587, -0.24730449914932, 0.24883271753788, -0.25031912326813, 0.25176304578781, -0.25316381454468, 0.25452083349228, -0.25583347678185, 0.25710114836693, -0.2583232820034, 0.25949934124947, -0.26062881946564, 0.26171118021011, -0.26274597644806, 0.26373273134232, -0.26467105746269, 0.26556047797203, -0.26640066504478, 0.26719126105309, -0.26793190836906, 0.26862227916718, -0.26926213502884, 0.26985120773315, -0.27038922905922, 0.2708760201931, -0.27131137251854, 0.27169513702393, -0.27202719449997, 0.27230739593506, -0.27253571152687, 0.27271205186844, -0.27283638715744, 0.27290868759155, -0.27292901277542, 0.27289739251137, -0.27281391620636, 0.27267861366272, -0.27249166369438, 0.27225321531296, -0.27196338772774, 0.27162238955498, -0.27123045921326, 0.27078783512115, -0.27029478549957, 0.26975157856941, -0.26915854215622, 0.26851600408554, -0.26782432198524, 0.26708391308784, -0.26629513502121, 0.26545843482018, -0.26457425951958, 0.26364308595657, -0.26266539096832, 0.26164171099663, -0.26057255268097, 0.25945848226547, -0.25830006599426, 0.25709787011147, -0.25585255026817, 0.25456470251083, -0.25323495268822, 0.25186401605606, -0.25045254826546, 0.24900121986866, -0.24751077592373, 0.24598191678524, -0.24441538751125, 0.24281194806099, -0.24117237329483, 0.23949745297432, -0.23778794705868, 0.23604469001293, -0.23426848649979, 0.23246018588543, -0.23062059283257, 0.2287505865097, -0.22685101628304, 0.22492274641991, -0.22296665608883, 0.22098363935947, -0.21897456049919, 0.21694032847881, -0.21488185226917, 0.21280002593994, -0.21069577336311, 0.20857000350952, -0.20642364025116, 0.20425759255886, -0.20207281410694, 0.19987021386623, -0.19765071570873, 0.19541524350643, -0.19316475093365, 0.19090014696121, -0.18862235546112, 0.18633233010769, -0.18403095006943, 0.18171916902065, -0.1793978959322, 0.17706805467606, -0.17473052442074, 0.1723862439394, -0.17003609240055, 0.16768097877502, -0.16532176733017, 0.16295936703682, -0.16059462726116, 0.15822842717171, -0.15586161613464, 0.15349505841732, -0.15112958848476, 16266.05078125, 614.0, 161.0, 0.15082331001759, -0.15313883125782, 0.15545523166656, -0.15777170658112, 0.16008745133877, -0.16240167617798, 0.16471356153488, -0.16702228784561, 0.16932702064514, -0.17162695527077, 0.1739212423563, -0.17620904743671, 0.17848953604698, -0.18076185882092, 0.18302516639233, -0.18527860939503, 0.18752133846283, -0.18975251913071, 0.19197127223015, -0.19417674839497, 0.19636809825897, -0.19854447245598, 0.2007050216198, -0.20284889638424, 0.20497523248196, -0.20708321034908, 0.20917195081711, -0.21124064922333, 0.21328845620155, -0.21531453728676, 0.21731807291508, -0.21929824352264, 0.22125422954559, -0.22318521142006, 0.22509041428566, -0.22696901857853, 0.22882026433945, -0.23064334690571, 0.23243750631809, -0.23420199751854, 0.23593604564667, -0.23763893544674, 0.23930990695953, -0.24094827473164, 0.24255330860615, -0.24412432312965, 0.24566063284874, -0.24716156721115, 0.2486264705658, -0.25005468726158, 0.25144562125206, -0.25279861688614, 0.25411310791969, -0.25538849830627, 0.25662419199944, -0.25781965255737, 0.25897437334061, -0.26008778810501, 0.26115942001343, -0.26218876242638, 0.26317536830902, -0.2641187608242, 0.26501852273941, -0.26587423682213, 0.26668551564217, -0.26745197176933, 0.26817321777344, -0.26884895563126, 0.26947888731956, -0.27006262540817, 0.27059999108315, -0.27109065651894, 0.27153441309929, -0.27193102240562, 0.27228027582169, -0.27258205413818, 0.27283614873886, -0.27304247021675, 0.27320083975792, -0.27331122756004, 0.27337351441383, -0.27338767051697, 0.27335369586945, -0.27327156066895, 0.27314123511314, -0.27296283841133, 0.27273637056351, -0.27246192097664, 0.27213960886002, -0.27176955342293, 0.27135187387466, -0.27088674902916, 0.27037435770035, -0.26981493830681, 0.2692086994648, -0.26855584979057, 0.26785671710968, -0.26711156964302, 0.26632070541382, -0.26548448204994, 0.26460322737694, -0.263677328825, 0.26270714402199, -0.26169312000275, 0.26063567399979, -0.25953525304794, 0.25839230418205, -0.2572073340416, 0.25598081946373, -0.25471329689026, 0.25340533256531, -0.25205743312836, 0.25067019462585, -0.24924418330193, 0.2477800399065, -0.24627834558487, 0.24473977088928, -0.24316492676735, 0.24155451357365, -0.23990918695927, 0.23822964727879, -0.23651659488678, 0.23477074503899, -0.23299285769463, 0.23118363320827, -0.22934386134148, 0.22747428715229, -0.22557570040226, 0.22364889085293, -0.22169463336468, 0.21971376240253, -0.21770706772804, 0.21567539870739, -0.21361956000328, 0.21154041588306, -0.20943878591061, 0.20731554925442, -0.20517154037952, 0.20300763845444, -0.20082470774651, 0.19862362742424, -0.19640526175499, 0.19417050480843, -0.1919202208519, 0.18965531885624, -0.1873766630888, 0.18508516252041, -0.18278168141842, 0.18046714365482, -0.17814241349697, 0.1758083999157, -0.17346596717834, 0.17111602425575, -0.16875943541527, 0.16639709472656, -0.16402986645699, 0.16165865957737, -0.15928430855274, 0.15690769255161, -0.15452966094017, 0.15215109288692, 16742.681640625, 635.0, 160.0, -0.15139065682888, 0.15373253822327, -0.15607605874538, 0.15842036902905, -0.16076464951038, 0.16310808062553, -0.16544979810715, 0.16778895258904, -0.17012470960617, 0.17245617508888, -0.17478248476982, 0.17710277438164, -0.17941614985466, 0.18172174692154, -0.1840186715126, 0.18630601465702, -0.18858289718628, 0.19084841012955, -0.19310167431831, 0.19534176588058, -0.19756782054901, 0.19977889955044, -0.20197412371635, 0.20415258407593, -0.20631338655949, 0.20845565199852, -0.21057845652103, 0.21268093585968, -0.21476218104362, 0.21682134270668, -0.21885749697685, 0.22086982429028, -0.22285741567612, 0.22481942176819, -0.22675500810146, 0.22866329550743, -0.23054347932339, 0.2323947250843, -0.234216183424, 0.23600707948208, -0.23776659369469, 0.23949393630028, -0.24118834733963, 0.2428490370512, -0.24447524547577, 0.2460662573576, -0.24762132763863, 0.24913974106312, -0.25062081217766, 0.25206381082535, -0.25346812605858, 0.25483304262161, -0.256157964468, 0.25744226574898, -0.25868529081345, 0.2598865032196, -0.26104530692101, 0.26216116547585, -0.26323351264, 0.26426184177399, -0.26524567604065, 0.26618453860283, -0.26707792282104, 0.26792544126511, -0.26872664690018, 0.26948118209839, -0.27018859982491, 0.2708486020565, -0.27146086096764, 0.27202501893044, -0.27254083752632, 0.27300798892975, -0.27342629432678, 0.27379548549652, -0.27411538362503, 0.2743858397007, -0.27460664510727, 0.27477768063545, -0.27489885687828, 0.27497011423111, -0.27499136328697, 0.27496254444122, -0.27488368749619, 0.27475482225418, -0.27457591891289, 0.27434709668159, -0.27406838536263, 0.27373993396759, -0.27336186170578, 0.27293431758881, -0.2724574804306, 0.27193155884743, -0.27135676145554, 0.27073335647583, -0.27006158232689, 0.26934176683426, -0.26857420802116, 0.26775923371315, -0.26689723134041, 0.26598855853081, -0.26503363251686, 0.26403287053108, -0.26298674941063, 0.26189568638802, -0.26076021790504, 0.25958082079887, -0.25835806131363, 0.25709244608879, -0.25578457117081, 0.2544350028038, -0.25304439663887, 0.25161331892014, -0.25014242529869, 0.24863241612911, -0.24708391726017, 0.24549765884876, -0.24387434124947, 0.24221467971802, -0.24051943421364, 0.23878933489323, -0.23702518641949, 0.23522774875164, -0.23339781165123, 0.23153620958328, -0.22964376211166, 0.22772128880024, -0.2257696390152, 0.22378967702389, -0.22178226709366, 0.21974827349186, -0.21768860518932, 0.21560414135456, -0.21349577605724, 0.21136443316936, -0.2092110067606, 0.20703645050526, -0.20484165847301, 0.20262758433819, -0.20039515197277, 0.19814531505108, -0.19587901234627, 0.19359718263149, -0.19130077958107, 0.18899075686932, -0.18666805326939, 0.18433363735676, -0.18198843300343, 0.17963342368603, -0.17726953327656, 0.17489770054817, -0.17251889407635, 0.17013403773308, -0.16774408519268, 0.16534993052483, -0.16295254230499, 0.16055281460285, -0.15815168619156, 0.15575005114079, -0.1533488035202, 0.15094885230064, 17233.28125, 650.0, 170.0, 0.15043792128563, -0.15272869169712, 0.15501959621906, -0.15730985999107, 0.15959873795509, -0.16188542544842, 0.16416916251183, -0.16644914448261, 0.16872458159924, -0.17099471390247, 0.17325872182846, -0.17551581561565, 0.17776519060135, -0.18000607192516, 0.18223764002323, -0.18445910513401, 0.1866696625948, -0.18886852264404, 0.19105488061905, -0.19322794675827, 0.19538693130016, -0.19753102958202, 0.19965946674347, -0.2017714381218, 0.20386619865894, -0.20594294369221, 0.20800089836121, -0.21003930270672, 0.21205739676952, -0.2140544205904, 0.21602962911129, -0.21798227727413, 0.21991162002087, -0.22181694209576, 0.2236975133419, -0.22555261850357, 0.22738155722618, -0.22918364405632, 0.23095817863941, -0.2327044904232, 0.23442190885544, -0.23610979318619, 0.2377674728632, -0.23939435184002, 0.24098978936672, -0.2425531744957, 0.2440839111805, -0.24558141827583, 0.24704512953758, -0.24847447872162, 0.24986891448498, -0.25122791528702, 0.25255098938942, -0.25383761525154, 0.2550872862339, -0.25629955530167, 0.25747394561768, -0.25861003994942, 0.25970742106438, -0.26076564192772, 0.26178431510925, -0.26276311278343, 0.26370161771774, -0.26459950208664, 0.2654564678669, -0.26627215743065, 0.26704633235931, -0.26777866482735, 0.26846894621849, -0.26911687850952, 0.26972231268883, -0.27028498053551, 0.27080473303795, -0.27128139138222, 0.2717148065567, -0.27210482954979, 0.27245137095451, -0.27275434136391, 0.27301362156868, -0.27322918176651, 0.27340099215508, -0.27352902293205, 0.27361327409744, -0.27365371584892, 0.27365043759346, -0.27360346913338, 0.273512840271, -0.27337870001793, 0.27320113778114, -0.27298024296761, 0.27271616458893, -0.27240908145905, 0.27205914258957, -0.27166655659676, 0.27123153209686, -0.27075430750847, 0.27023509144783, -0.26967415213585, 0.26907175779343, -0.26842823624611, 0.26774388551712, -0.26701900362968, 0.26625394821167, -0.26544907689095, 0.26460474729538, -0.26372134685516, 0.26279929280281, -0.26183897256851, 0.2608408331871, -0.2598052918911, 0.25873282551765, -0.25762391090393, 0.25647902488708, -0.25529864430428, 0.25408327579498, -0.25283345580101, 0.25154972076416, -0.25023257732391, 0.24888260662556, -0.24750037491322, 0.24608644843102, -0.24464139342308, 0.24316583573818, -0.24166035652161, 0.24012556672096, -0.23856210708618, 0.23697058856487, -0.23535165190697, 0.2337059378624, -0.23203410208225, 0.23033680021763, -0.22861471772194, 0.22686848044395, -0.22509880363941, 0.22330635786057, -0.22149181365967, 0.21965588629246, -0.21779926121235, 0.21592262387276, -0.21402668952942, 0.21211215853691, -0.21017973124981, 0.20823012292385, -0.20626406371593, 0.20428222417831, -0.20228534936905, 0.20027415454388, -0.19824934005737, 0.19621162116528, -0.19416171312332, 0.19210033118725, -0.19002819061279, 0.18794599175453, -0.1858544498682, 0.18375428020954, -0.18164616823196, 0.17953081429005, -0.17740893363953, 0.17528119683266, -0.17314830422401, 0.17101095616817, -0.16886980831623, 0.16672556102276, -0.16457885503769, 0.16243037581444, -0.1602807790041, 0.15813072025776, -0.15598084032536, 0.15383177995682, -0.15168417990208, 17738.25390625, 671.0, 172.0, -0.15029707551003, 0.15249440073967, -0.15469114482403, 0.15688662230968, -0.15908017754555, 0.1612711250782, -0.16345877945423, 0.16564245522022, -0.16782148182392, 0.16999514400959, -0.17216277122498, 0.1743236631155, -0.17647710442543, 0.17862243950367, -0.18075893819332, 0.18288591504097, -0.1850026845932, 0.18710851669312, -0.18920275568962, 0.19128467142582, -0.1933535784483, 0.1954088062048, -0.19744963943958, 0.19947539269924, -0.20148539543152, 0.20347893238068, -0.20545536279678, 0.20741398632526, -0.20935414731503, 0.21127516031265, -0.21317635476589, 0.21505710482597, -0.21691673994064, 0.21875458955765, -0.22057005763054, 0.22236247360706, -0.22413121163845, 0.22587567567825, -0.22759521007538, 0.2292892485857, -0.23095715045929, 0.23259836435318, -0.23421227931976, 0.23579831421375, -0.23735593259335, 0.23888455331326, -0.24038365483284, 0.24185265600681, -0.24329106509686, 0.24469836056232, -0.24607402086258, 0.24741756916046, -0.24872849881649, 0.25000634789467, -0.251250654459, 0.25246095657349, -0.25363683700562, 0.25477784872055, -0.2558836042881, 0.25695368647575, -0.25798767805099, 0.25898525118828, -0.25994601845741, 0.26086962223053, -0.26175573468208, 0.26260405778885, -0.26341423392296, 0.26418602466583, -0.26491913199425, 0.26561325788498, -0.26626819372177, 0.26688367128372, -0.26745948195457, 0.26799541711807, -0.26849129796028, 0.26894694566727, -0.26936215162277, 0.26973682641983, -0.27007079124451, 0.27036398649216, -0.27061623334885, 0.27082753181458, -0.27099773287773, 0.27112683653831, -0.27121478319168, 0.27126151323318, -0.27126708626747, 0.2712314426899, -0.2711546421051, 0.27103671431541, -0.27087771892548, 0.27067768573761, -0.27043676376343, 0.27015498280525, -0.26983249187469, 0.26946941018105, -0.26906588673592, 0.26862207055092, -0.26813814043999, 0.26761430501938, -0.2670507133007, 0.26644763350487, -0.26580530405045, 0.26512390375137, -0.2644037604332, 0.2636451125145, -0.26284825801849, 0.26201349496841, -0.2611411511898, 0.26023152470589, -0.25928500294685, 0.25830191373825, -0.25728261470795, 0.25622749328613, -0.25513696670532, 0.25401142239571, -0.2528512775898, 0.25165694952011, -0.2504289150238, 0.24916757643223, -0.2478734254837, 0.24654695391655, -0.2451886087656, 0.2437989115715, -0.24237835407257, 0.24092747271061, -0.23944675922394, 0.23793677985668, -0.23639807105064, 0.23483116924763, -0.23323665559292, 0.23161508142948, -0.22996704280376, 0.22829312086105, -0.22659389674664, 0.22486996650696, -0.22312197089195, 0.22135049104691, -0.21955615282059, 0.21773959696293, -0.21590143442154, 0.21404232084751, -0.21216288208961, 0.21026375889778, -0.20834563672543, 0.20640914142132, -0.20445492863655, 0.20248368382454, -0.20049604773521, 0.19849270582199, -0.19647432863712, 0.1944415718317, -0.19239512085915, 0.19033566117287, -0.18826386332512, 0.18618041276932, -0.18408596515656, 0.18198123574257, -0.17986686527729, 0.17774356901646, -0.17561200261116, 0.17347285151482, -0.17132678627968, 0.16917449235916, -0.16701662540436, 0.16485388576984, -0.16268691420555, 0.16051639616489, -0.1583429723978, 0.1561673283577, -0.15399008989334, 0.15181194245815, 18258.025390625, 692.0, 176.0, 0.15208092331886, -0.15418119728565, 0.15628290176392, -0.15838545560837, 0.16048826277256, -0.16259072721004, 0.16469222307205, -0.16679213941097, 0.16888985037804, -0.1709847599268, 0.17307621240616, -0.17516358196735, 0.17724624276161, -0.17932353913784, 0.18139483034611, -0.18345949053764, 0.18551684916019, -0.18756626546383, 0.18960706889629, -0.19163863360882, 0.19366028904915, -0.19567137956619, 0.1976712346077, -0.19965921342373, 0.2016346603632, -0.20359688997269, 0.20554527640343, -0.207479134202, 0.20939783751965, -0.21130070090294, 0.21318708360195, -0.21505634486675, 0.21690781414509, -0.21874086558819, 0.22055485844612, -0.22234913706779, 0.22412306070328, -0.22587601840496, 0.22760738432407, -0.22931651771069, 0.23100280761719, -0.23266564309597, 0.23430442810059, -0.23591853678226, 0.23750740289688, -0.23907041549683, 0.24060700833797, -0.24211660027504, 0.24359863996506, -0.24505254626274, 0.24647779762745, -0.24787382781506, 0.24924011528492, -0.2505761384964, 0.25188136100769, -0.2531553208828, 0.25439748167992, -0.25560736656189, 0.25678452849388, -0.25792849063873, 0.25903880596161, -0.26011499762535, 0.26115667819977, -0.26216343045235, 0.26313480734825, -0.26407048106194, 0.26497000455856, -0.26583302021027, 0.26665922999382, -0.26744821667671, 0.26819971203804, -0.26891335844994, 0.2695888876915, -0.27022597193718, 0.2708243727684, -0.27138382196426, 0.27190408110619, -0.27238491177559, 0.27282607555389, -0.27322739362717, 0.2735887169838, -0.2739098072052, 0.27419054508209, -0.27443078160286, 0.27463042736053, -0.27478930354118, 0.27490738034248, -0.27498453855515, 0.27502074837685, -0.27501595020294, 0.27497011423111, -0.27488321065903, 0.27475526928902, -0.27458629012108, 0.27437630295753, -0.27412536740303, 0.27383357286453, -0.27350094914436, 0.27312761545181, -0.27271369099617, 0.27225932478905, -0.27176460623741, 0.27122974395752, -0.27065491676331, 0.27004027366638, -0.26938608288765, 0.26869249343872, -0.26795980334282, 0.26718825101852, -0.26637810468674, 0.26552966237068, -0.26464319229126, 0.26371899247169, -0.26275745034218, 0.26175886392593, -0.26072362065315, 0.2596520781517, -0.25854459404945, 0.25740161538124, -0.25622352957726, 0.25501072406769, -0.25376370549202, 0.25248289108276, -0.25116875767708, 0.2498217523098, -0.24844238162041, 0.24703113734722, -0.24558855593204, 0.2441151291132, -0.2426114231348, 0.24107794463634, -0.23951527476311, 0.23792396485806, -0.23630461096764, 0.23465777933598, -0.23298406600952, 0.23128408193588, -0.22955843806267, 0.22780774533749, -0.22603264451027, 0.22423376142979, -0.22241173684597, 0.22056724131107, -0.21870090067387, 0.21681341528893, -0.21490542590618, 0.21297761797905, -0.21103067696095, 0.20906527340412, -0.20708212256432, 0.20508189499378, -0.2030652910471, 0.20103302598, -0.1989857852459, 0.19692429900169, -0.19484926760197, 0.19276139140129, -0.19066140055656, 0.18854999542236, -0.18642790615559, 0.18429583311081, -0.18215450644493, 0.18000464141369, -0.17784693837166, 0.17568212747574, -0.17351090908051, 0.17133401334286, -0.16915214061737, 0.16696599125862, -0.16477626562119, 0.16258369386196, -0.16038893163204, 0.15819270908833, -0.15599569678307, 0.15379859507084, -0.15160205960274, 18793.025390625, 714.0, 176.0, 0.15043441951275, -0.15260227024555, 0.15477219223976, -0.15694355964661, 0.15911570191383, -0.16128794848919, 0.16345964372158, -0.16563010215759, 0.16779865324497, -0.16996458172798, 0.17212723195553, -0.17428588867188, 0.17643985152245, -0.17858843505383, 0.18073092401028, -0.18286660313606, 0.18499477207661, -0.18711471557617, 0.18922571837902, -0.19132706522942, 0.19341804087162, -0.19549791514874, 0.19756597280502, -0.19962151348591, 0.20166380703449, -0.20369213819504, 0.20570579171181, -0.20770405232906, 0.20968621969223, -0.21165156364441, 0.21359939873219, -0.21552899479866, 0.21743968129158, -0.21933074295521, 0.22120149433613, -0.22305126488209, 0.22487933933735, -0.22668506205082, 0.22846774756908, -0.23022675514221, 0.23196139931679, -0.23367105424404, 0.23535504937172, -0.23701277375221, 0.23864357173443, -0.24024684727192, 0.24182198941708, -0.24336837232113, 0.24488541483879, -0.24637253582478, 0.24782916903496, -0.24925473332405, 0.25064867734909, -0.2520104944706, 0.25333961844444, -0.25463551282883, 0.25589773058891, -0.2571257352829, 0.25831905007362, -0.25947719812393, 0.26059973239899, -0.26168623566628, 0.26273626089096, -0.26374936103821, 0.26472517848015, -0.26566329598427, 0.2665633559227, -0.26742500066757, 0.26824787259102, -0.26903167366982, 0.26977604627609, -0.27048075199127, 0.27114546298981, -0.27176994085312, 0.27235388755798, -0.27289715409279, 0.27339944243431, -0.27386060357094, 0.27428042888641, -0.2746587395668, 0.27499544620514, -0.27529034018517, 0.27554333209991, -0.27575436234474, 0.27592328190804, -0.27605006098747, 0.27613466978073, -0.27617701888084, 0.27617716789246, -0.27613505721092, 0.27605074644089, -0.27592423558235, 0.27575561404228, -0.27554497122765, 0.27529233694077, -0.27499786019325, 0.2746616601944, -0.27428385615349, 0.27386462688446, -0.27340412139893, 0.27290257811546, -0.27236014604568, 0.27177706360817, -0.27115359902382, 0.27048999071121, -0.26978650689125, 0.26904344558716, -0.26826110482216, 0.26743978261948, -0.26657983660698, 0.26568159461021, -0.26474547386169, 0.26377177238464, -0.2627609372139, 0.26171338558197, -0.26062947511673, 0.25950971245766, -0.25835448503494, 0.25716429948807, -0.25593960285187, 0.25468090176582, -0.25338870286942, 0.25206345319748, -0.25070574879646, 0.24931609630585, -0.2478950470686, 0.24644313752651, -0.24496096372604, 0.24344907701015, -0.24190807342529, 0.24033854901791, -0.2387411147356, 0.23711638152599, -0.23546496033669, 0.23378750681877, -0.23208463191986, 0.23035699129105, -0.22860524058342, 0.22683005034924, -0.22503206133842, 0.2232119590044, -0.22137041389942, 0.2195081114769, -0.21762573719025, 0.21572399139404, -0.21380354464054, 0.21186512708664, -0.20990940928459, 0.2079371213913, -0.20594894886017, 0.20394560694695, -0.20192781090736, 0.199896261096, -0.19785168766975, 0.19579477608204, -0.19372627139091, 0.1916468590498, -0.18955726921558, 0.18745818734169, -0.18535034358501, 0.18323445320129, -0.18111118674278, 0.17898128926754, -0.17684541642666, 0.17470429837704, -0.17255860567093, 0.17040903866291, -0.1682562828064, 0.16610100865364, -0.16394390165806, 0.16178561747074, -0.15962681174278, 0.1574681699276, -0.15531033277512, 0.15315392613411, -0.15099960565567, 19343.703125, 730.0, 190.0, 0.15043546259403, -0.15247450768948, 0.15451312065125, -0.15655076503754, 0.15858690440655, -0.16062098741531, 0.16265246272087, -0.16468080878258, 0.16670547425747, -0.16872589290142, 0.17074152827263, -0.17275182902813, 0.1747562289238, -0.17675419151783, 0.17874516546726, -0.18072859942913, 0.18270391225815, -0.18467059731483, 0.18662805855274, -0.18857577443123, 0.19051317870617, -0.19243973493576, 0.19435489177704, -0.1962581127882, 0.19814883172512, -0.20002652704716, 0.20189066231251, -0.20374068617821, 0.20557606220245, -0.20739628374577, 0.20920081436634, -0.21098911762238, 0.21276068687439, -0.2145150154829, 0.21625156700611, -0.21796986460686, 0.2196693867445, -0.22134964168072, 0.22301012277603, -0.22465036809444, 0.22626988589764, -0.22786818444729, 0.22944483160973, -0.23099932074547, 0.23253121972084, -0.23404006659985, 0.23552542924881, -0.2369868606329, 0.23842392861843, -0.23983620107174, 0.24122329056263, -0.24258475005627, 0.24392022192478, -0.2452292740345, 0.24651153385639, -0.24776662886143, 0.24899418652058, -0.25019383430481, 0.25136524438858, -0.25250807404518, 0.25362193584442, -0.25470659136772, 0.25576165318489, -0.25678682327271, 0.25778183341026, -0.25874638557434, 0.25968018174171, -0.2605829834938, 0.26145449280739, -0.26229447126389, 0.26310271024704, -0.26387897133827, 0.26462298631668, -0.26533460617065, 0.26601359248161, -0.26665976643562, 0.26727294921875, -0.26785299181938, 0.26839971542358, -0.26891297101974, 0.26939263939857, -0.26983857154846, 0.27025067806244, -0.27062880992889, 0.2709729373455, -0.27128294110298, 0.27155873179436, -0.27180030941963, 0.27200755476952, -0.27218043804169, 0.27231895923615, -0.27242308855057, 0.27249282598495, -0.27252814173698, 0.27252906560898, -0.27249565720558, 0.27242791652679, -0.27232587337494, 0.27218961715698, -0.27201917767525, 0.27181467413902, -0.27157616615295, 0.27130374312401, -0.2709975540638, 0.27065768837929, -0.27028426527977, 0.26987743377686, -0.26943731307983, 0.26896414160728, -0.26845800876617, 0.26791909337044, -0.26734763383865, 0.26674380898476, -0.26610779762268, 0.26543983817101, -0.26474013924599, 0.2640089392662, -0.26324650645256, 0.26245304942131, -0.26162886619568, 0.26077419519424, -0.25988933444023, 0.25897458195686, -0.25803017616272, 0.25705647468567, -0.25605377554893, 0.25502237677574, -0.25396263599396, 0.25287485122681, -0.25175938010216, 0.25061658024788, -0.24944677948952, 0.24825036525726, -0.24702769517899, 0.24577914178371, -0.24450507760048, 0.24320591986179, -0.24188204109669, 0.24053384363651, -0.23916174471378, 0.23776613175869, -0.23634745180607, 0.23490610718727, -0.23344253003597, 0.23195716738701, -0.23045042157173, 0.2289227694273, -0.22737464308739, 0.22580650448799, -0.22421880066395, 0.22261197865009, -0.22098651528358, 0.21934288740158, -0.21768154203892, 0.21600297093391, -0.21430763602257, 0.2125960290432, -0.21086862683296, 0.20912592113018, -0.20736838877201, 0.20559652149677, -0.20381082594395, 0.20201177895069, -0.20019988715649, 0.19837562739849, -0.19653953611851, 0.19469207525253, -0.19283376634121, 0.19096511602402, -0.18908661603928, 0.18719877302647, -0.18530207872391, 0.1833970695734, -0.18148422241211, 0.17956405878067, -0.1776370704174, 0.17570377886295, -0.17376466095448, 0.17182025313377, -0.16987103223801, 0.16791751980782, -0.16596020758152, 0.16399958729744, -0.16203618049622, 0.16007046401501, -0.15810294449329, 0.1561341136694, -0.15416446328163, 0.15219448506832, -0.15022467076778, 19910.517578125, 751.0, 199.0, -0.15077827870846, 0.15262980759144, -0.15448220074177, 0.15633504092693, -0.15818794071674, 0.16004045307636, -0.16189220547676, 0.16374273598194, -0.16559167206287, 0.16743855178356, -0.16928297281265, 0.17112450301647, -0.17296271026134, 0.1747971624136, -0.17662742733955, 0.17845305800438, -0.18027363717556, 0.1820887029171, -0.18389782309532, 0.18570055067539, -0.18749643862247, 0.18928505480289, -0.19106595218182, 0.1928386837244, -0.19460278749466, 0.19635781645775, -0.19810333848, 0.19983890652657, -0.20156405866146, 0.20327834784985, -0.20498134195805, 0.20667257905006, -0.20835161209106, 0.21001800894737, -0.21167130768299, 0.21331107616425, -0.21493688225746, 0.21654826402664, -0.21814480423927, 0.21972604095936, -0.22129157185555, 0.22284093499184, -0.22437371313572, 0.22588948905468, -0.22738781571388, 0.22886829078197, -0.23033048212528, 0.23177398741245, -0.23319837450981, 0.23460327088833, -0.23598822951317, 0.2373528778553, -0.23869679868221, 0.24001961946487, -0.24132095277309, 0.24260038137436, -0.24385756254196, 0.24509212374687, -0.24630366265774, 0.24749183654785, -0.24865628778934, 0.24979667365551, -0.25091260671616, 0.25200378894806, -0.25306987762451, 0.25411051511765, -0.25512540340424, 0.25611424446106, -0.25707668066025, 0.25801241397858, -0.25892120599747, 0.25980269908905, -0.26065662503242, 0.26148274540901, -0.26228073239326, 0.26305040717125, -0.26379144191742, 0.26450362801552, -0.26518669724464, 0.26584047079086, -0.26646468043327, 0.26705914735794, -0.26762363314629, 0.2681579887867, -0.2686619758606, 0.26913544535637, -0.26957821846008, 0.26999014616013, -0.27037104964256, 0.2707208096981, -0.27103927731514, 0.2713263630867, -0.27158188819885, 0.27180579304695, -0.27199798822403, 0.2721583545208, -0.27228683233261, 0.2723833322525, -0.27244782447815, 0.27248024940491, -0.27248057723045, 0.27244877815247, -0.2723847925663, 0.2722886800766, -0.27216041088104, 0.27199995517731, -0.27180740237236, 0.27158278226852, -0.27132606506348, 0.27103736996651, -0.27071675658226, 0.27036425471306, -0.26997998356819, 0.2695640027523, -0.26911646127701, 0.26863744854927, -0.26812708377838, 0.26758551597595, -0.26701286435127, 0.26640930771828, -0.26577499508858, 0.26511013507843, -0.26441487669945, 0.26368939876556, -0.26293396949768, 0.26214876770973, -0.26133400201797, 0.26048994064331, -0.259616792202, 0.25871485471725, -0.25778436660767, 0.25682559609413, -0.2558388710022, 0.25482442975044, -0.25378260016441, 0.25271368026733, -0.25161802768707, 0.25049594044685, -0.24934779107571, 0.24817389249802, -0.24697461724281, 0.24575033783913, -0.24450142681599, 0.24322827160358, -0.24193125963211, 0.24061079323292, -0.23926728963852, 0.23790116608143, -0.23651285469532, 0.23510277271271, -0.23367136716843, 0.23221909999847, -0.23074641823769, 0.22925378382206, -0.22774168848991, 0.22621057927608, -0.22466097772121, 0.2230933457613, -0.22150820493698, 0.21990604698658, -0.21828739345074, 0.21665275096893, -0.21500267088413, 0.21333764493465, -0.21165823936462, 0.20996499061584, -0.20825843513012, 0.20653913915157, -0.20480763912201, 0.20306450128555, -0.20131032168865, 0.19954562187195, -0.19777101278305, 0.19598707556725, -0.1941943615675, 0.19239348173141, -0.19058501720428, 0.18876956403255, -0.18694771826267, 0.18512006103992, -0.18328721821308, 0.18144978582859, -0.1796083599329, 0.17776356637478, -0.17591598629951, 0.17406626045704, -0.1722149848938, 0.1703627705574, -0.16851022839546, 0.16665799915791, -0.16480666399002, 0.16295686364174, -0.16110920906067, 0.15926429629326, -0.15742276608944, 0.15558521449566, -0.15375226736069, 0.15192453563213, -0.15010263025761, 20493.939453125, 777.0, 209.0, -0.15041793882847, 0.15230821073055, -0.15420046448708, 0.15609426796436, -0.15798917412758, 0.15988470613956, -0.16178044676781, 0.16367590427399, -0.16557061672211, 0.16746410727501, -0.16935592889786, 0.17124558985233, -0.17313259840012, 0.17501649260521, -0.17689678072929, 0.17877295613289, -0.18064454197884, 0.18251104652882, -0.18437197804451, 0.18622681498528, -0.18807508051395, 0.18991626799107, -0.19174985587597, 0.19357538223267, -0.19539229571819, 0.19720011949539, -0.19899834692478, 0.20078645646572, -0.20256394147873, 0.20433031022549, -0.20608505606651, 0.20782767236233, -0.20955763757229, 0.21127447485924, -0.21297766268253, 0.21466670930386, -0.21634112298489, 0.21800038218498, -0.21964402496815, 0.22127152979374, -0.2228824198246, 0.22447621822357, -0.22605243325233, 0.22761057317257, -0.22915017604828, 0.23067077994347, -0.23217189311981, 0.23365306854248, -0.23511382937431, 0.23655374348164, -0.23797234892845, 0.23936919867992, -0.24074386060238, 0.24209588766098, -0.24342487752438, 0.24473038315773, -0.24601200222969, 0.24726933240891, -0.24850195646286, 0.24970950186253, -0.25089156627655, 0.25204774737358, -0.25317773222923, 0.25428110361099, -0.25535753369331, 0.25640663504601, -0.25742813944817, 0.2584216594696, -0.25938686728477, 0.26032349467278, -0.26123121380806, 0.2621097266674, -0.26295873522758, 0.26377800107002, -0.26456722617149, 0.26532617211342, -0.26605460047722, 0.26675227284431, -0.26741895079613, 0.2680544257164, -0.2686585187912, 0.26923102140427, -0.26977172493935, 0.27028051018715, -0.27075719833374, 0.27120164036751, -0.27161371707916, 0.27199327945709, -0.27234023809433, 0.27265447378159, -0.27293592691422, 0.27318453788757, -0.27340018749237, 0.27358287572861, -0.27373254299164, 0.27384915947914, -0.27393275499344, 0.27398326992989, -0.27400073409081, 0.27398520708084, -0.27393671870232, 0.27385529875755, -0.2737410068512, 0.27359393239021, -0.27341419458389, 0.27320185303688, -0.27295702695847, 0.27267986536026, -0.27237051725388, 0.2720291018486, -0.2716558277607, 0.27125084400177, -0.27081435918808, 0.27034655213356, -0.26984769105911, 0.26931795477867, -0.26875764131546, 0.26816695928574, -0.26754620671272, 0.266895622015, -0.26621556282043, 0.26550629734993, -0.26476812362671, 0.26400142908096, -0.26320651173592, 0.26238372921944, -0.26153346896172, 0.2606560587883, -0.25975194573402, 0.25882151722908, -0.25786516070366, 0.2568833231926, -0.25587639212608, 0.2548448741436, -0.25378918647766, 0.25270980596542, -0.25160717964172, 0.25048181414604, -0.24933423101902, 0.24816489219666, -0.24697433412075, 0.24576307833195, -0.24453164637089, 0.24328058958054, -0.24201044440269, 0.24072179198265, -0.23941516876221, 0.23809117078781, -0.23675037920475, 0.23539339005947, -0.2340207695961, 0.23263315856457, -0.23123113811016, 0.22981533408165, -0.22838638722897, 0.22694490849972, -0.22549153864384, 0.22402691841125, -0.2225516885519, 0.22106650471687, -0.21957202255726, 0.21806889772415, -0.21655778586864, 0.21503938734531, -0.21351432800293, 0.21198332309723, -0.21044701337814, 0.20890611410141, -0.20736128091812, 0.20581319928169, -0.2042625695467, 0.2027100622654, -0.20115639269352, 0.19960221648216, -0.1980482339859, 0.19649514555931, -0.19494363665581, 0.19339437782764, -0.19184808433056, 0.19030544161797, -0.18876712024212, 0.18723380565643, -0.18570618331432, 0.1841849386692, -0.18267075717449, 0.18116427958012, -0.17966622114182, 0.17817722260952, -0.17669793963432, 0.1752290725708, -0.17377123236656, 0.17232508957386, -0.17089129984379, 0.16947048902512, -0.16806329786777, 0.16667035222054, -0.16529227793217, 0.16392970085144, -0.16258320212364, 0.1612534224987, -0.15994092822075, 0.15864633023739, -0.15737017989159, 0.15611308813095, -0.15487557649612, 0.15365822613239, -0.15246158838272, 0.15128616988659, -0.15013253688812, 21094.458984375, 796.0, 227.0, 0.1517168879509, -0.15354582667351, 0.15537498891354, -0.15720400214195, 0.15903241932392, -0.16085988283157, 0.16268594563007, -0.16451025009155, 0.16633234918118, -0.16815185546875, 0.16996836662292, -0.17178145051003, 0.17359073460102, -0.17539578676224, 0.17719620466232, -0.17899157106876, 0.18078149855137, -0.18256556987762, 0.18434338271618, -0.18611453473568, 0.18787860870361, -0.18963521718979, 0.19138395786285, -0.1931244134903, 0.19485621154308, -0.19657894968987, 0.19829221069813, -0.19999565184116, 0.2016888409853, -0.20337142050266, 0.2050429880619, -0.20670318603516, 0.20835161209106, -0.20998790860176, 0.21161171793938, -0.21322265267372, 0.21482037007809, -0.2164045125246, 0.21797470748425, -0.2195306122303, 0.22107189893723, -0.22259822487831, 0.22410923242569, -0.22560462355614, 0.22708405554295, -0.22854721546173, 0.22999379038811, -0.23142346739769, 0.23283596336842, -0.23423095047474, 0.23560817539692, -0.23696732521057, 0.23830813169479, -0.23963032662868, 0.2409336566925, -0.24221785366535, 0.24348266422749, -0.24472784996033, 0.2459531724453, -0.24715840816498, 0.24834331870079, -0.24950771033764, 0.25065138936043, -0.25177410244942, 0.25287571549416, -0.25395601987839, 0.25501483678818, -0.25605198740959, 0.25706735253334, -0.25806075334549, 0.25903204083443, -0.25998109579086, 0.26090779900551, -0.26181200146675, 0.26269361376762, -0.26355254650116, 0.26438871026039, -0.26520198583603, 0.26599231362343, -0.26675966382027, 0.26750391721725, -0.26822507381439, 0.26892307400703, -0.26959791779518, 0.27024954557419, -0.27087792754173, 0.27148312330246, -0.27206510305405, 0.27262386679649, -0.27315947413445, 0.2736719250679, -0.27416127920151, 0.27462756633759, -0.2750708758831, 0.2754912674427, -0.27588880062103, 0.27626356482506, -0.27661564946175, 0.27694520354271, -0.27725228667259, 0.27753701806068, -0.2777995467186, 0.27804002165794, -0.27825859189034, 0.27845537662506, -0.27863055467606, 0.27878430485725, -0.27891677618027, 0.27902820706367, -0.27911877632141, 0.27918866276741, -0.27923810482025, 0.27926728129387, -0.27927649021149, 0.27926588058472, -0.27923578023911, 0.27918636798859, -0.27911791205406, 0.27903071045876, -0.27892503142357, 0.27880111336708, -0.27865925431252, 0.27849978208542, -0.27832293510437, 0.27812904119492, -0.2779184281826, 0.27769139409065, -0.27744826674461, 0.27718934416771, -0.27691501379013, 0.2766255736351, -0.27632138133049, 0.27600276470184, -0.27567011117935, 0.27532374858856, -0.27496403455734, 0.27459138631821, -0.2742061316967, 0.27380862832069, -0.27339932322502, 0.27297854423523, -0.27254667878151, 0.27210414409637, -0.27165132761002, 0.27118861675262, -0.27071639895439, 0.27023506164551, -0.26974508166313, 0.26924678683281, -0.26874062418938, 0.26822698116302, -0.26770627498627, 0.26717895269394, -0.26664537191391, 0.26610597968102, -0.26556119322777, 0.26501142978668, -0.26445707678795, 0.2638985812664, -0.26333636045456, 0.26277080178261, -0.26220235228539, 0.2616314291954, -0.26105839014053, 0.26048371195793, -0.25990781188011, 0.25933104753494, -0.25875383615494, 0.25817662477493, -0.25759980082512, 0.25702378153801, -0.25644892454147, 0.25587567687035, -0.2553043961525, 0.25473546981812, -0.25416934490204, 0.25360634922981, -0.25304690003395, 0.25249132514, -0.25194007158279, 0.25139346718788, -0.25085186958313, 0.25031566619873, -0.24978519976139, 0.24926082789898, -0.2487428933382, 0.24823173880577, -0.24772769212723, 0.24723111093044, -0.24674229323864, 0.24626156687737, -0.24578925967216, 0.2453256547451, -0.24487107992172, 0.24442580342293, -0.24399012327194, 0.24356433749199, -0.24314869940281, 0.2427434772253, -0.24234893918037, 0.24196533858776, -0.2415929287672, 0.24123193323612, -0.24088257551193, 0.24054510891438, -0.24021971225739, 0.23990662395954, -0.23960603773594, 0.23931811749935, -0.2390430867672, 0.23878107964993, -0.23853228986263, 0.23829686641693, -0.23807495832443, 0.23786669969559, -0.23767223954201, 0.23749168217182, -0.23732514679432, 0.23717273771763, -0.23703455924988, 0.23691068589687, -0.23680120706558, 0.23670618236065, -0.23662567138672, 0.23655973374844, -0.23650841414928, 0.23647172749043, 21712.572265625, 821.0, 202.0, -0.15084165334702, 0.15265250205994, -0.15446458756924, 0.15627761185169, -0.15809127688408, 0.15990528464317, -0.16171932220459, 0.16353312134743, -0.16534635424614, 0.16715875267982, -0.16896998882294, 0.17077980935574, -0.17258788645267, 0.17439392209053, -0.17619766294956, 0.17799878120422, -0.17979699373245, 0.18159201741219, -0.18338356912136, 0.18517135083675, -0.18695509433746, 0.18873451650143, -0.19050931930542, 0.1922792494297, -0.19404400885105, 0.19580334424973, -0.19755697250366, 0.19930462539196, -0.20104603469372, 0.2027809470892, -0.20450907945633, 0.2062302082777, -0.20794406533241, 0.20965038239956, -0.21134893596172, 0.21303947269917, -0.21472173929214, 0.21639551222324, -0.21806053817272, 0.21971660852432, -0.22136348485947, 0.22300094366074, -0.22462876141071, 0.22624672949314, -0.2278546243906, 0.229452252388, -0.23103940486908, 0.23261587321758, -0.23418147861958, 0.2357360124588, -0.23727931082249, 0.23881116509438, -0.24033139646053, 0.24183987081051, -0.24333636462688, 0.24482075870037, -0.24629287421703, 0.24775256216526, -0.24919967353344, 0.2506340444088, -0.25205555558205, 0.25346407294273, -0.25485947728157, 0.25624158978462, -0.25761035084724, 0.25896561145782, -0.26030725240707, 0.26163521409035, -0.26294934749603, 0.26424959301949, -0.26553583145142, 0.26680800318718, -0.26806601881981, 0.26930978894234, -0.27053925395012, 0.27175435423851, -0.27295503020287, 0.27414122223854, -0.27531287074089, 0.27646994590759, -0.27761241793633, 0.27874022722244, -0.27985337376595, 0.28095179796219, -0.28203552961349, 0.2831044793129, -0.28415870666504, 0.2851981818676, -0.28622290492058, 0.28723287582397, -0.28822812438011, 0.28920862078667, -0.29017442464828, 0.29112553596497, -0.29206201434135, 0.29298385977745, -0.2938911318779, 0.29478386044502, -0.29566207528114, 0.29652586579323, -0.2973752617836, 0.2982103228569, -0.29903107881546, 0.29983767867088, -0.30063012242317, 0.30140849947929, -0.30217289924622, 0.30292341113091, -0.30366009473801, 0.30438303947449, -0.30509236454964, 0.30578815937042, -0.30647051334381, 0.30713951587677, -0.30779531598091, 0.30843797326088, -0.30906760692596, 0.30968436598778, -0.31028833985329, 0.3108796775341, -0.31145843863487, 0.31202480196953, -0.31257888674736, 0.31312081217766, -0.31365069746971, 0.31416872143745, -0.31467497348785, 0.31516960263252, -0.31565275788307, 0.31612458825111, -0.31658521294594, 0.31703478097916, -0.31747344136238, 0.31790137290955, -0.31831866502762, 0.31872549653053, -0.3191220164299, 0.31950837373734, -0.31988471746445, 0.32025119662285, -0.32060799002647, 0.32095521688461, -0.32129302620888, 0.3216215968132, -0.3219410777092, 0.32225158810616, -0.32255333662033, 0.32284644246101, -0.32313105463982, 0.32340732216835, -0.32367542386055, 0.3239354789257, -0.32418766617775, 0.32443210482597, -0.32466894388199, 0.32489836215973, -0.32512047886848, 0.32533544301987, -0.32554340362549, 0.32574447989464, -0.32593885064125, 0.32612663507462, -0.32630795240402, 0.32648295164108, -0.32665175199509, 0.32681453227997, -0.32697135210037, 0.32712239027023, -0.32726773619652, 0.32740753889084, -0.32754188776016, 0.32767090201378, -0.3277947306633, 0.32791346311569, -0.32802721858025, 0.32813608646393, -0.32824015617371, 0.32833954691887, -0.32843437790871, 0.32852470874786, -0.32861062884331, 0.32869222760201, -0.32876962423325, 0.32884284853935, -0.32891201972961, 0.32897719740868, -0.32903844118118, 0.32909581065178, -0.32914939522743, 0.32919922471046, -0.32924538850784, 0.32928791642189, -0.32932686805725, 0.32936227321625, -0.32939419150352, 0.32942265272141, -0.32944768667221, 0.32946929335594, -0.32948756217957, 0.32950246334076, -0.32951405644417, 0.32952231168747, 22348.80078125, 839.0, 184.0, -0.15038871765137, 0.1522990167141, -0.15421836078167, 0.15614657104015, -0.15808349847794, 0.16002896428108, -0.16198278963566, 0.16394484043121, -0.16591490805149, 0.16789281368256, -0.1698784083128, 0.17187148332596, -0.17387187480927, 0.17587938904762, -0.1778938472271, 0.17991504073143, -0.18194279074669, 0.18397690355778, -0.18601717054844, 0.18806341290474, -0.19011542201042, 0.19217300415039, -0.19423593580723, 0.19630402326584, -0.19837707281113, 0.20045484602451, -0.2025371491909, 0.20462377369404, -0.2067144960165, 0.20880909264088, -0.21090736985207, 0.21300908923149, -0.21511402726173, 0.21722197532654, -0.21933269500732, 0.22144596278667, -0.22356155514717, 0.2256792485714, -0.22779881954193, 0.22991999983788, -0.23204259574413, 0.23416636884212, -0.23629106581211, 0.23841646313667, -0.24054232239723, 0.24266839027405, -0.24479445815086, 0.24692025780678, -0.24904555082321, 0.25117012858391, -0.25329369306564, 0.25541603565216, -0.25753691792488, 0.2596560716629, -0.26177325844765, 0.26388823986053, -0.26600074768066, 0.26811054348946, -0.27021741867065, 0.27232104539871, -0.2744212448597, 0.2765177488327, -0.27861025929451, 0.28069859743118, -0.28278249502182, 0.2848616540432, -0.28693586587906, 0.2890048623085, -0.29106840491295, 0.2931262254715, -0.29517811536789, 0.2972237765789, -0.29926294088364, 0.30129542946815, -0.30332094430923, 0.30533921718597, -0.30735003948212, 0.30935314297676, -0.31134828925133, 0.31333521008492, -0.31531366705894, 0.31728339195251, -0.31924417614937, 0.3211957514286, -0.32313787937164, 0.32507029175758, -0.32699275016785, 0.32890504598618, -0.33080691099167, 0.33269807696342, -0.33457833528519, 0.33644741773605, -0.33830511569977, 0.34015119075775, -0.3419853746891, 0.34380745887756, -0.34561720490456, 0.34741434454918, -0.3491986989975, 0.35097000002861, -0.35272800922394, 0.35447254776955, -0.35620331764221, 0.35792016983032, -0.35962280631065, 0.36131104826927, -0.36298468708992, 0.3646434545517, -0.36628717184067, 0.36791560053825, -0.3695285320282, 0.37112575769424, -0.37270706892014, 0.37427225708961, -0.3758210837841, 0.37735339999199, -0.37886896729469, 0.38036757707596, -0.38184902071953, 0.38331314921379, -0.38475975394249, 0.38618859648705, -0.38759952783585, 0.38899233937263, -0.39036685228348, 0.39172288775444, -0.39306026697159, 0.39437881112099, -0.39567831158638, 0.39695861935616, -0.39821955561638, 0.39946097135544, -0.40068265795708, 0.40188449621201, -0.40306627750397, 0.40422788262367, -0.40536913275719, 0.4064898788929, -0.4075899720192, 0.40866926312447, -0.40972757339478, 0.41076481342316, -0.41178080439568, 0.41277542710304, -0.41374856233597, 0.4147000014782, -0.4156297147274, 0.41653749346733, -0.41742327809334, 0.41828688979149, -0.41912826895714, 0.41994726657867, -0.42074376344681, 0.42151767015457, -0.42226886749268, 0.42299726605415, -0.42370274662971, 0.42438521981239, -0.42504459619522, 0.42568081617355, -0.42629373073578, 0.42688331007957, -0.42744943499565, 0.42799204587936, -0.42851108312607, 0.42900642752647, -0.42947807908058, 0.4299259185791, -0.43034988641739, 0.43074995279312, -0.43112605810165, 0.43147811293602, -0.43180611729622, 0.43211001157761, -0.43238973617554, 0.43264529109001, -0.43287658691406, 0.43308362364769, -0.43326637148857, 0.43342483043671, -0.43355891108513, 0.43366864323616, -0.4337540268898, 0.43381500244141, 23003.669921875, 856.0, 167.0, 0.15094435214996, -0.15325945615768, 0.15559229254723, -0.15794265270233, 0.16031035780907, -0.16269521415234, 0.16509701311588, -0.16751553118229, 0.16995054483414, -0.17240184545517, 0.17486917972565, -0.17735233902931, 0.1798510402441, -0.18236507475376, 0.18489414453506, -0.18743802607059, 0.18999642133713, -0.19256906211376, 0.1951556801796, -0.19775596261024, 0.20036964118481, -0.2029964029789, 0.20563594996929, -0.20828796923161, 0.21095214784145, -0.21362814307213, 0.21631565690041, -0.21901433169842, 0.22172383964062, -0.22444382309914, 0.22717395424843, -0.22991386055946, 0.23266318440437, -0.23542156815529, 0.23818862438202, -0.2409639954567, 0.24374727904797, -0.2465381026268, 0.24933606386185, -0.25214079022408, 0.25495183467865, -0.2577688395977, 0.26059138774872, -0.26341903209686, 0.26625138521194, -0.26908802986145, 0.27192848920822, -0.27477237582207, 0.27761927247047, -0.28046867251396, 0.28332018852234, -0.28617334365845, 0.28902772068977, -0.29188284277916, 0.29473823308945, -0.29759347438812, 0.30044808983803, -0.30330157279968, 0.3061535358429, -0.30900341272354, 0.31185081601143, -0.31469520926476, 0.31753614544868, -0.32037311792374, 0.32320564985275, -0.32603326439857, 0.32885548472404, -0.33167177438736, 0.33448171615601, -0.33728474378586, 0.34008041024208, -0.34286820888519, 0.34564763307571, -0.34841820597649, 0.35117939114571, -0.35393074154854, 0.3566717505455, -0.35940185189247, 0.36212062835693, -0.36482754349709, 0.36752212047577, -0.37020382285118, 0.37287214398384, -0.37552663683891, 0.37816679477692, -0.38079208135605, 0.38340201973915, -0.38599610328674, 0.38857388496399, -0.39113479852676, 0.39367842674255, -0.39620423316956, 0.39871171116829, -0.40120044350624, 0.40366989374161, -0.40611958503723, 0.40854907035828, -0.41095781326294, 0.41334539651871, -0.4157113134861, 0.41805511713028, -0.42037633061409, 0.42267447710037, -0.42494913935661, 0.42719981074333, -0.42942607402802, 0.4316274523735, -0.43380352854729, 0.43595385551453, -0.43807798624039, 0.44017550349236, -0.4422459602356, 0.44428893923759, -0.44630402326584, 0.44829082489014, -0.45024889707565, 0.4521778523922, -0.45407727360725, 0.45594680309296, -0.45778602361679, 0.45959457755089, -0.46137204766273, 0.46311810612679, -0.46483236551285, 0.46651449799538, -0.46816408634186, 0.46978083252907, -0.47136440873146, 0.47291442751884, -0.474430590868, 0.47591260075569, -0.47736012935638, 0.47877284884453, -0.4801504611969, 0.4814926981926, -0.4827992618084, 0.48406985402107, -0.48530423641205, 0.48650214076042, -0.48766329884529, 0.48878747224808, -0.48987439274788, 0.49092385172844, -0.49193561077118, 0.49290949106216, -0.49384522438049, 0.49474263191223, -0.49560156464577, 0.4964217543602, -0.49720308184624, 0.49794536828995, -0.49864846467972, 0.49931219220161, -0.49993640184402, 0.50052100419998, -0.50106579065323, 0.50157076120377, -0.50203573703766, 0.50246053934097, -0.50284522771835, 0.50318962335587, -0.50349372625351, 0.50375735759735, -0.50398057699203, 0.50416326522827, -0.50430536270142, 0.50440692901611, 23677.728515625, 864.0, 159.0, 0.15156273543835, -0.15420551598072, 0.15687140822411, -0.15956020355225, 0.16227161884308, -0.16500540077686, 0.1677612811327, -0.17053896188736, 0.17333817481995, -0.17615860700607, 0.17899994552135, -0.18186189234257, 0.18474408984184, -0.1876462250948, 0.19056795537472, -0.19350892305374, 0.19646875560284, -0.19944709539413, 0.20244356989861, -0.20545779168606, 0.20848934352398, -0.21153785288334, 0.21460288763046, -0.21768403053284, 0.22078086435795, -0.22389294207096, 0.22701981663704, -0.23016105592251, 0.23331618309021, -0.23648473620415, 0.23966623842716, -0.24286022782326, 0.24606618285179, -0.24928362667561, 0.25251206755638, -0.25575095415115, 0.2589997947216, -0.26225808262825, 0.26552528142929, -0.2688008248806, 0.2720842063427, -0.27537482976913, 0.27867218852043, -0.28197568655014, 0.28528478741646, -0.28859889507294, 0.29191744327545, -0.29523983597755, 0.29856550693512, -0.30189383029938, 0.30522421002388, -0.3085560798645, 0.31188881397247, -0.31522178649902, 0.31855440139771, -0.32188600301743, 0.32521599531174, -0.32854375243187, 0.33186864852905, -0.33519002795219, 0.33850729465485, -0.34181973338127, 0.34512677788734, -0.34842771291733, 0.35172194242477, -0.35500881075859, 0.35828766226768, -0.36155781149864, 0.36481866240501, -0.36806949973106, 0.37130969762802, -0.37453857064247, 0.37775549292564, -0.38095980882645, 0.38415080308914, -0.38732787966728, 0.39049032330513, -0.39363750815392, 0.39676877856255, -0.39988344907761, 0.402980864048, -0.40606039762497, 0.40912136435509, -0.41216310858727, 0.41518500447273, -0.41818636655807, 0.42116656899452, -0.4241249859333, 0.42706093192101, -0.42997378110886, 0.43286287784576, -0.43572762608528, 0.43856739997864, -0.44138151407242, 0.44416937232018, -0.44693037867546, 0.44966390728951, -0.45236933231354, 0.45504602789879, -0.45769345760345, 0.46031096577644, -0.46289798617363, 0.46545392274857, -0.4679781794548, 0.47047024965286, -0.47292947769165, 0.47535535693169, -0.47774732112885, 0.480104804039, -0.48242726922035, 0.48471418023109, -0.48696503043175, 0.48917925357819, -0.49135640263557, 0.49349591135979, -0.49559730291367, 0.49766007065773, -0.49968376755714, 0.50166791677475, -0.50361198186874, 0.50551563501358, -0.50737828016281, 0.50919961929321, -0.51097911596298, 0.51271635293961, -0.51441103219986, 0.51606261730194, -0.51767081022263, 0.5192351937294, -0.52075535058975, 0.52223098278046, -0.52366173267365, 0.52504724264145, -0.526387155056, 0.52768117189407, -0.52892905473709, 0.53013038635254, -0.53128492832184, 0.53239238262177, -0.53345257043839, 0.53446513414383, -0.53542983531952, 0.53634649515152, -0.53721487522125, 0.53803479671478, -0.53880602121353, 0.53952831029892, -0.5402016043663, 0.5408256649971, -0.54140031337738, 0.5419254899025, -0.54240107536316, 0.54282683134079, -0.54320281744003, 0.54352879524231, -0.54380482435226, 0.54403072595596, -0.54420644044876, 0.5443320274353
        
        
    ];
  
    
    
    //7751
    self.qdata4096sr44100 = [ 44100.0, 4096.0, 168.0, 174.60000610352, 16.0, 2.0, 0.2618864774704, -0.16196233034134, 179.71617126465, 16.0, 2.0, 0.18637634813786, -0.25305169820786, 184.98225402832, 17.0, 2.0, -0.26573938131332, 0.1642552614212, 190.40264892578, 17.0, 2.0, -0.19589208066463, 0.25426584482193, 195.98187255859, 18.0, 2.0, 0.26500180363655, -0.17820982635021, 201.72457885742, 18.0, 2.0, 0.19390805065632, -0.26090261340141, 207.63555908203, 19.0, 2.0, -0.25966593623161, 0.20161393284798, 213.71974182129, 19.0, 2.0, -0.18151590228081, 0.26890915632248, 219.98220825195, 20.0, 2.0, 0.2471676915884, -0.23036371171474, 226.42819213867, 20.0, 3.0, 0.15926609933376, -0.27204129099846, 0.16996331512928, 233.06303405762, 21.0, 2.0, -0.22420080006123, 0.25713717937469, 239.8923034668, 22.0, 2.0, 0.26301068067551, -0.21713860332966, 246.92169189453, 22.0, 3.0, 0.18893319368362, -0.27170243859291, 0.16855995357037, 254.15704345703, 23.0, 2.0, -0.23600722849369, 0.25646296143532, 261.60440063477, 24.0, 2.0, 0.2635213136673, -0.22723686695099, 269.27001953125, 24.0, 3.0, 0.19018910825253, -0.2721606194973, 0.19305215775967, 277.16021728516, 25.0, 3.0, -0.22722221910954, 0.26645424962044, -0.15995310246944, 285.28164672852, 26.0, 2.0, 0.25232070684433, -0.25197672843933, 293.64102172852, 26.0, 3.0, 0.16769714653492, -0.266357421875, 0.23355410993099, 302.24536132812, 27.0, 3.0, -0.19762209057808, 0.27177980542183, -0.2147074341774, 311.1018371582, 28.0, 3.0, 0.22094272077084, -0.27142480015755, 0.19769342243671, 320.21780395508, 29.0, 3.0, -0.23793026804924, 0.26785853505135, -0.18353387713432, 329.60092163086, 30.0, 3.0, 0.24962908029556, -0.26309055089951, 0.17287302017212, 339.25894165039, 30.0, 4.0, 0.16315452754498, -0.25724712014198, 0.25849390029907, -0.16563786566257, 349.20001220703, 31.0, 4.0, -0.17668920755386, 0.26191273331642, -0.25501954555511, 0.16203124821186, 359.4323425293, 32.0, 4.0, 0.18640719354153, -0.26454335451126, 0.25306722521782, -0.16159510612488, 369.96450805664, 33.0, 4.0, -0.19269014894962, 0.26575601100922, -0.25282660126686, 0.1642382144928, 380.80529785156, 34.0, 4.0, 0.19589722156525, -0.26588380336761, 0.2542652785778, -0.16986590623856, 391.96374511719, 35.0, 4.0, -0.19627477228642, 0.26501604914665, -0.25711777806282, 0.17824497818947, 403.44915771484, 36.0, 4.0, 0.19394065439701, -0.26304349303246, 0.26091846823692, -0.1889616549015, 415.27111816406, 37.0, 4.0, -0.18898482620716, 0.25968536734581, -0.26508766412735, 0.20159746706486, 427.43948364258, 38.0, 4.0, 0.18151789903641, -0.25454440712929, 0.26891785860062, -0.21566419303417, 439.96441650391, 39.0, 4.0, -0.1716040968895, 0.24718657135963, -0.2715510725975, 0.23035289347172, 452.85638427734, 40.0, 5.0, 0.15926168859005, -0.23718571662903, 0.27205774188042, -0.2445650100708, 0.16994252800941, 466.12606811523, 42.0, 4.0, 0.22421550750732, -0.26950314640999, 0.25713828206062, -0.19363376498222, 479.78460693359, 43.0, 4.0, -0.20812605321407, 0.26302883028984, -0.26666814088821, 0.21717092394829, 493.84338378906, 44.0, 5.0, 0.18893752992153, -0.25198572874069, 0.27171784639359, -0.23873755335808, 0.16853691637516, 508.31408691406, 45.0, 5.0, -0.16715435683727, 0.23603536188602, -0.27099868655205, 0.25648453831673, -0.19898506999016, 523.20880126953, 47.0, 5.0, -0.21525624394417, 0.26354098320007, -0.26822552084923, 0.22726888954639, -0.15772679448128, 538.5400390625, 48.0, 5.0, 0.19023422896862, -0.24888677895069, 0.2721765935421, -0.25071305036545, 0.19309613108635, 554.32043457031, 49.0, 6.0, -0.16193467378616, 0.22724072635174, -0.2670487165451, 0.2664635181427, -0.22568847239017, 0.15992721915245, 570.56329345703, 51.0, 5.0, -0.19962251186371, 0.25234591960907, -0.27219167351723, 0.25197347998619, -0.19896717369556, 587.28204345703, 52.0, 6.0, 0.16775371134281, -0.22867169976234, 0.26637730002403, -0.26823750138283, 0.23358702659607, -0.17405666410923, 604.49072265625, 54.0, 6.0, 0.19763150811195, -0.24886457622051, 0.27180200815201, -0.25903189182281, 0.21468675136566, -0.15258868038654, 622.20367431641, 55.0, 6.0, -0.16192865371704, 0.22096116840839, -0.26147797703743, 0.27144199609756, -0.24777314066887, 0.19766789674759, 640.43560791016, 57.0, 6.0, -0.18540462851524, 0.23796498775482, -0.26835444569588, 0.26788100600243, -0.23666313290596, 0.18358936905861, 659.20184326172, 59.0, 6.0, -0.20387291908264, 0.24965991079807, -0.27138814330101, 0.26311582326889, -0.22709819674492, 0.17293387651443, 678.51788330078, 60.0, 7.0, 0.16314931213856, -0.21762529015541, 0.25727832317352, -0.2721960246563, 0.2584961950779, -0.21973124146461, 0.16560643911362, 698.40002441406, 62.0, 7.0, 0.17675319314003, -0.22745896875858, 0.26193851232529, -0.27196198701859, 0.25504836440086, -0.2153193205595, 0.16210043430328, 718.86468505859, 64.0, 7.0, 0.186468064785, -0.23389753699303, 0.26457008719444, -0.27151462435722, 0.25309959053993, -0.21356600522995, 0.16166551411152, 739.92901611328, 66.0, 7.0, 0.19275023043156, -0.23757648468018, 0.2657830119133, -0.27128523588181, 0.25286003947258, -0.21452355384827, 0.1643096357584, 761.61059570312, 68.0, 7.0, 0.19590857625008, -0.23890787363052, 0.26591640710831, -0.27141851186752, 0.25426176190376, -0.21799241006374, 0.16983190178871, 783.92749023438, 70.0, 7.0, 0.1962855309248, -0.23814383149147, 0.26505246758461, -0.27182450890541, 0.25711941719055, -0.22381229698658, 0.1782091408968, 806.89831542969, 72.0, 7.0, 0.19395042955875, -0.23532496392727, 0.26308125257492, -0.27218049764633, 0.26092448830605, -0.23139725625515, 0.18892641365528, 830.54223632812, 74.0, 8.0, 0.18899367749691, -0.23038032650948, 0.25972172617912, -0.27201363444328, 0.26509615778923, -0.24018312990665, 0.20156475901604, -0.15557000041008, 854.87896728516, 76.0, 8.0, 0.1815924346447, -0.22320459783077, 0.25458192825317, -0.27071869373322, 0.26894763112068, -0.24955648183823, 0.21572257578373, -0.17278358340263, 879.92883300781, 78.0, 8.0, 0.17168536782265, -0.21358652412891, 0.24722927808762, -0.26761344075203, 0.2715802192688, -0.25849860906601, 0.23040530085564, -0.19156141579151, 905.71276855469, 80.0, 9.0, 0.15935318171978, -0.20137193799019, 0.23723460733891, -0.2620002925396, 0.27208399772644, -0.26598712801933, 0.2446086704731, -0.21105991303921, 0.17002855241299, 932.25213623047, 83.0, 9.0, -0.18648917973042, 0.22424481809139, -0.25322932004929, 0.26954016089439, -0.27090755105019, 0.25713673233986, -0.23014660179615, 0.19359505176544, -0.15217892825603, 959.56921386719, 85.0, 9.0, -0.16919846832752, 0.20814745128155, -0.24078966677189, 0.26307067275047, -0.27210038900375, 0.26668077707291, -0.24752777814865, 0.21713902056217, -0.17933636903763, 987.68676757812, 88.0, 9.0, 0.1889468729496, -0.22440986335278, 0.25202983617783, -0.26848956942558, 0.27174761891365, -0.26139357686043, 0.23871985077858, -0.20649589598179, 0.1684914380312, 1016.6281738281, 90.0, 10.0, 0.16715063154697, -0.20420998334885, 0.23607334494591, -0.25923717021942, 0.27103760838509, -0.27008283138275, 0.25648269057274, -0.2318310290575, 0.19894386827946, -0.16140456497669, 1046.4176025391, 93.0, 10.0, -0.18056584894657, 0.21528388559818, -0.2439671009779, 0.26358667016029, -0.27199205756187, 0.26824283599854, -0.25275576114655, 0.22723992168903, -0.19443191587925, 0.15768006443977, 1077.080078125, 95.0, 11.0, -0.15448935329914, 0.19032491743565, -0.22284166514874, 0.2489361166954, -0.26598235964775, 0.27220731973648, -0.26695013046265, 0.25076007843018, -0.22531650960445, 0.19318406283855, -0.15744586288929, 1108.6408691406, 98.0, 11.0, 0.1619288623333, -0.19644682109356, 0.22727708518505, -0.25160282850266, 0.26709371805191, -0.27222234010696, 0.26647588610649, -0.25042754411697, 0.22565649449825, -0.19452932476997, 0.15987923741341, 1141.1265869141, 101.0, 11.0, -0.16647797822952, 0.19971030950546, -0.22920110821724, 0.25239795446396, -0.26720038056374, 0.2722295820713, -0.26700878143311, 0.25202643871307, -0.22867225110531, 0.19905608892441, -0.16573755443096, 1174.5640869141, 104.0, 11.0, 0.16786396503448, -0.20008215308189, 0.22874218225479, -0.25150284171104, 0.26642054319382, -0.27218472957611, 0.26827982068062, -0.2550496160984, 0.23365503549576, -0.20593105256557, 0.17416383326054, 1208.9814453125, 107.0, 12.0, -0.1662612259388, 0.19772781431675, -0.22600504755974, 0.24891963601112, -0.26462998986244, 0.27183651924133, -0.2699328660965, 0.25907731056213, -0.24017441272736, 0.21476908028126, -0.18486830592155, 0.15271484851837, 1244.4073486328, 110.0, 12.0, 0.16204896569252, -0.19287882745266, 0.22104161977768, -0.24451377987862, 0.26152780652046, -0.27076181769371, 0.27148431539536, -0.26363557577133, 0.24783432483673, -0.22530956566334, 0.1977656930685, -0.16719931364059, 1280.8712158203, 113.0, 13.0, -0.15511356294155, 0.185413017869, -0.2136774212122, 0.23801532387733, -0.25671407580376, 0.26841196417809, -0.27223870158195, 0.26790601015091, -0.25573831796646, 0.23663836717606, -0.21199329197407, 0.18353189527988, -0.15315121412277, 1318.4036865234, 117.0, 12.0, -0.17554907500744, 0.20389747619629, -0.22917112708092, 0.24971869587898, -0.26414442062378, 0.27144274115562, -0.27109697461128, 0.26313054561615, -0.24810481071472, 0.22706341743469, -0.20143024623394, 0.1728723347187, 1357.0357666016, 120.0, 13.0, 0.16314485669136, -0.19149021804333, 0.21766301989555, -0.24008284509182, 0.25733414292336, -0.26829382777214, 0.27223464846611, -0.26889288425446, 0.25849309563637, -0.24172674119473, 0.21968778967857, -0.19377160072327, 0.1655490398407, 1396.8000488281, 124.0, 13.0, 0.17688208818436, -0.20356863737106, 0.22754363715649, -0.24741618335247, 0.26198866963387, -0.27035936713219, 0.27200105786324, -0.26680779457092, 0.25510427355766, -0.23761759698391, 0.21541354060173, -0.18980467319489, 0.16223944723606, 1437.7293701172, 127.0, 14.0, -0.15957327187061, 0.18648163974285, -0.21172061562538, 0.2339490801096, -0.25193026661873, 0.26463031768799, -0.27130258083344, 0.27154943346977, -0.26535555720329, 0.25308910012245, -0.23547104001045, 0.21351547539234, -0.18844690918922, 0.16160243749619, 1479.8580322266, 131.0, 14.0, -0.16690039634705, 0.19277058541775, -0.21675372123718, 0.23763124644756, -0.25429734587669, 0.26584267616272, -0.2716246843338, 0.2713178396225, -0.26493936777115, 0.2528478205204, -0.23571480810642, 0.21447239816189, -0.19024123251438, 0.16424587368965, 1523.2211914062, 135.0, 14.0, -0.17110356688499, 0.19603164494038, -0.21902905404568, 0.2389875203371, -0.25490674376488, 0.26596587896347, -0.2715836763382, 0.2714612185955, -0.26560440659523, 0.25432348251343, -0.23820987343788, 0.21809266507626, -0.194978043437, 0.16997741162777, 1567.8549804688, 139.0, 15.0, -0.17209054529667, 0.19630855321884, -0.21868684887886, 0.23820528388023, -0.25393944978714, 0.26512339711189, -0.27120238542557, 0.27187156677246, -0.26709750294685, 0.25712043046951, -0.24243727326393, 0.22376678884029, -0.20199978351593, 0.1781385242939, -0.1532301902771, 1613.7966308594, 143.0, 15.0, -0.17034134268761, 0.19397446513176, -0.21596872806549, 0.23538242280483, -0.25135174393654, 0.26314583420753, -0.27021414041519, 0.27222275733948, -0.26907646656036, 0.26092502474785, -0.24815322458744, 0.23135524988174, -0.21129569411278, 0.18886005878448, -0.16499863564968, 1661.0844726562, 147.0, 16.0, -0.16599413752556, 0.18913055956364, -0.2109155356884, 0.23047889769077, -0.24700699746609, 0.25979134440422, -0.26827171444893, 0.27207094430923, -0.27101841568947, 0.26516085863113, -0.25475937128067, 0.24027302861214, -0.22233048081398, 0.20169116556644, -0.17919947206974, 0.15573489665985, 1709.7579345703, 151.0, 16.0, -0.15886244177818, 0.18160019814968, -0.20333454012871, 0.22325809299946, -0.24059817194939, 0.25465986132622, -0.26486584544182, 0.27079001069069, -0.27218234539032, 0.26898396015167, -0.26133030653, 0.24954332411289, -0.23411230742931, 0.21566517651081, -0.19493226706982, 0.17270481586456, 1759.8576660156, 156.0, 16.0, 0.17168094217777, -0.19333229959011, 0.21363100409508, -0.23184834420681, 0.24730591475964, -0.2594119310379, 0.267693400383, -0.27182218432426, 0.27163338661194, -0.26713448762894, 0.25850495696068, -0.24608619511127, 0.23036244511604, -0.21193420886993, 0.19148549437523, -0.16974741220474, 1811.4255371094, 160.0, 17.0, 0.1595289260149, -0.18095268309116, 0.2015085965395, -0.22052009403706, 0.23733457922935, -0.25135573744774, 0.26207384467125, -0.26909202337265, 0.27214697003365, -0.27112284302711, 0.26605749130249, -0.25714039802551, 0.24470274150372, -0.22920010983944, 0.21118886768818, -0.19129770994186, 0.17019611597061, 1864.5042724609, 165.0, 18.0, -0.1659923940897, 0.18665085732937, -0.20631341636181, 0.2243610471487, -0.24020344018936, 0.25330677628517, -0.26321950554848, 0.26959428191185, -0.27220523357391, 0.27095913887024, -0.26590010523796, 0.25720736384392, -0.24518629908562, 0.23025345802307, -0.21291601657867, 0.19374725222588, -0.17335940897465, 0.15237526595592, 1919.1384277344, 170.0, 18.0, 0.16937536001205, -0.18933878839016, 0.20828530192375, -0.22564899921417, 0.24089208245277, -0.25352889299393, 0.26314795017242, -0.26943093538284, 0.27216759324074, -0.27126553654671, 0.26675474643707, -0.25878602266312, 0.24762400984764, -0.23363474011421, 0.21726875007153, -0.19904035329819, 0.17950449883938, -0.15923239290714, 1975.3735351562, 175.0, 18.0, -0.16952033340931, 0.18896825611591, -0.20746020972729, 0.22447341680527, -0.23950970172882, 0.25211644172668, -0.26190611720085, 0.26857310533524, -0.27190718054771, 0.271802932024, -0.26826414465904, 0.26140394806862, -0.25143945217133, 0.23868218064308, -0.22352431714535, 0.20642153918743, -0.18787351250648, 0.16840279102325, 2033.2563476562, 180.0, 19.0, 0.16735003888607, -0.18627005815506, 0.20436431467533, -0.22115522623062, 0.23618337512016, -0.2490256279707, 0.25931218266487, -0.26674163341522, 0.27109360694885, -0.27223783731461, 0.2701396048069, -0.26486134529114, 0.25655993819237, -0.24548017978668, 0.23194463551044, -0.2163402736187, 0.19910277426243, -0.18069905042648, 0.16160900890827, 2092.8352050781, 185.0, 20.0, -0.1622307151556, 0.18075527250767, -0.19863410294056, 0.21542738378048, -0.23070615530014, 0.24406819045544, -0.2551531791687, 0.26365655660629, -0.26934140920639, 0.27204769849777, -0.27169865369797, 0.26830384135246, -0.26195871829987, 0.25284087657928, -0.2412031441927, 0.22736355662346, -0.21169312298298, 0.19460156559944, -0.17652195692062, 0.15789483487606, 2154.16015625, 190.0, 21.0, 0.15471565723419, -0.17282652854919, 0.19050805270672, -0.20735846459866, 0.22297902405262, -0.23698773980141, 0.24903282523155, -0.25880536437035, 0.26605051755905, -0.27057698369026, 0.27226403355598, -0.27106612920761, 0.26701456308365, -0.26021632552147, 0.25085020065308, -0.23916007578373, 0.22544598579407, -0.21005322039127, 0.193359836936, -0.17576333880424, 0.15766695141792, 2217.2817382812, 196.0, 21.0, 0.16214023530483, -0.17965626716614, 0.19662003219128, -0.21266035735607, 0.22741325199604, -0.24053393304348, 0.25170835852623, -0.26066401600838, 0.26717928051949, -0.27109128236771, 0.27230143547058, -0.27077916264534, 0.26656278967857, -0.25975826382637, 0.25053539872169, -0.23912194371223, 0.22579552233219, -0.21087417006493, 0.19470536708832, -0.17765451967716, 0.16009286046028, 2282.2531738281, 202.0, 21.0, 0.16647686064243, -0.18341419100761, 0.19975197315216, -0.21514968574047, 0.22927533090115, -0.24181587994099, 0.25248715281487, -0.26104307174683, 0.26728361845016, -0.27106159925461, 0.27228733897209, -0.27093172073364, 0.26702728867531, -0.26066693663597, 0.25200092792511, -0.24123187363148, 0.22860799729824, -0.21441504359245, 0.1989670842886, -0.18259645998478, 0.16564345359802, 2349.1281738281, 207.0, 23.0, -0.15115600824356, 0.16785168647766, -0.18427693843842, 0.20012082159519, -0.21507114171982, 0.22882351279259, -0.24109034240246, 0.2516094148159, -0.26015192270279, 0.26652953028679, -0.27060022950172, 0.27227279543877, -0.27150964736938, 0.26832804083824, -0.26279953122139, 0.25504767894745, -0.24524413049221, 0.23360335826874, -0.22037588059902, 0.20584067702293, -0.19029673933983, 0.17405414581299, -0.15742510557175, 2417.962890625, 213.0, 24.0, -0.15030242502689, 0.16650053858757, -0.18246808648109, 0.19792184233665, -0.21257661283016, 0.22615292668343, -0.23838469386101, 0.24902679026127, -0.25786203145981, 0.26470750570297, -0.26941981911659, 0.27189955115318, -0.27209395170212, 0.26999866962433, -0.26565787196159, 0.25916287302971, -0.2506494820118, 0.2402940094471, -0.22830805182457, 0.21493238210678, -0.20043008029461, 0.18507900834084, -0.16916421055794, 0.15297010540962, 2488.8146972656, 220.0, 24.0, 0.16204284131527, -0.17768225073814, 0.19291545450687, -0.20747920870781, 0.22111320495605, -0.23356686532497, 0.24460589885712, -0.25401869416237, 0.2616221010685, -0.26726639270782, 0.27083951234818, -0.27227023243904, 0.27152994275093, -0.26863375306129, 0.26363977789879, -0.25664767622948, 0.24779576063156, -0.23725716769695, 0.22523504495621, -0.2119569927454, 0.19766893982887, -0.18262848258018, 0.16709826886654, -0.15133924782276, 2561.7424316406, 226.0, 25.0, 0.15510140359402, -0.17040626704693, 0.18544210493565, -0.19996772706509, 0.21374170482159, -0.22652810811996, 0.23810243606567, -0.24825723469257, 0.25680747628212, -0.26359528303146, 0.26849409937859, -0.2714119553566, 0.27229398488998, -0.27112379670143, 0.26792389154434, -0.26275509595871, 0.25571495294571, -0.24693498015404, 0.23657743632793, -0.22483086585999, 0.21190530061722, -0.19802688062191, 0.1834322065115, -0.16836236417294, 0.15305727720261, 2636.8073730469, 233.0, 25.0, -0.16076475381851, 0.17556501924992, -0.19003459811211, 0.20395176112652, -0.21709612011909, 0.22925370931625, -0.24022197723389, 0.24981470406055, -0.25786650180817, 0.26423674821854, -0.26881325244904, 0.27151492238045, -0.27229371666908, 0.27113601565361, -0.26806280016899, 0.26312920451164, -0.25642305612564, 0.24806274473667, -0.23819418251514, 0.22698728740215, -0.2146317511797, 0.20133250951767, -0.18730479478836, 0.17276912927628, -0.15794630348682, 2714.0715332031, 240.0, 26.0, 0.16341780126095, -0.17773839831352, 0.19171765446663, -0.20515288412571, 0.21784308552742, -0.2295932918787, 0.24021889269352, -0.24954979121685, 0.25743433833122, -0.26374280452728, 0.26837036013603, -0.27123960852623, 0.27230232954025, -0.27154067158699, 0.26896753907204, -0.26462632417679, 0.25858980417252, -0.25095850229263, 0.2418582290411, -0.23143728077412, 0.2198628783226, -0.20731742680073, 0.19399435818195, -0.18009379506111, 0.16581827402115, -0.15136830508709, 2793.6000976562, 247.0, 26.0, -0.16326446831226, 0.17714381217957, -0.19071175158024, 0.20378389954567, -0.21617695689201, 0.22771246731281, -0.2382205426693, 0.24754343926907, -0.25553894042969, 0.2620835006237, -0.26707485318184, 0.27043431997299, -0.27210861444473, 0.27207091450691, -0.27032151818275, 0.26688787341118, -0.26182395219803, 0.25520902872086, -0.2471459209919, 0.23775884509087, -0.22719059884548, 0.21559944748878, -0.20315586030483, 0.1900387853384, -0.17643198370934, 0.16252025961876, 2875.4587402344, 254.0, 27.0, 0.15984739363194, -0.17340691387653, 0.18671880662441, -0.19961333274841, 0.21192079782486, -0.22347478568554, 0.23411539196968, -0.24369245767593, 0.25206857919693, -0.25912189483643, 0.26474869251251, -0.26886546611786, 0.27141070365906, -0.27234619855881, 0.27165776491165, -0.26935571432114, 0.2654744386673, -0.26007181406021, 0.25322797894478, -0.2450435757637, 0.23563773930073, -0.22514562308788, 0.21371559798717, -0.20150625705719, 0.18868328630924, -0.17541617155075, 0.16187493503094, 2959.7160644531, 261.0, 29.0, -0.15396106243134, 0.16719311475754, -0.1802633702755, 0.19301716983318, -0.20529842376709, 0.21695253252983, -0.22782917320728, 0.23778508603573, -0.24668678641319, 0.25441315770149, -0.26085782051086, 0.2659310400486, -0.2695617377758, 0.27169868350029, -0.27231168746948, 0.27139201760292, -0.26895272731781, 0.26502829790115, -0.25967398285866, 0.25296470522881, -0.24499364197254, 0.23587028682232, -0.22571836411953, 0.2146734893322, -0.20288048684597, 0.19049072265625, -0.17765925824642, 0.1645420640707, -0.15129318833351, 3046.4423828125, 269.0, 29.0, -0.15856367349625, 0.17137674987316, -0.18399220705032, 0.19626772403717, -0.20806036889553, 0.21922920644283, -0.22963756322861, 0.23915559053421, -0.24766251444817, 0.25504884123802, -0.26121839880943, 0.26609000563622, -0.2695991396904, 0.27169895172119, -0.2723613679409, 0.27157741785049, -0.26935750246048, 0.26573115587234, -0.26074656844139, 0.25446957349777, -0.24698254466057, 0.23838275671005, -0.22878065705299, 0.21829782426357, -0.20706479251385, 0.19521866738796, -0.18290077149868, 0.17025411128998, -0.1574210524559, 3135.7099609375, 277.0, 30.0, -0.15960137546062, 0.17209585011005, -0.18439304828644, 0.19636076688766, -0.20786651968956, 0.21877963840961, -0.22897343337536, 0.23832733929157, -0.24672895669937, 0.25407594442368, -0.26027789711952, 0.26525774598122, -0.26895329356194, 0.27131819725037, -0.27232280373573, 0.27195474505424, -0.27021899819374, 0.26713794469833, -0.26275086402893, 0.2571132183075, -0.2502957880497, 0.2423832565546, -0.23347283899784, 0.22367252409458, -0.21309922635555, 0.20187675952911, -0.19013378024101, 0.1780016720295, -0.16561233997345, 0.15309618413448, 3227.5932617188, 285.0, 31.0, -0.15854640305042, 0.17065443098545, -0.1825924217701, 0.19424049556255, -0.20547823607922, 0.21618638932705, -0.22624880075455, 0.23555418848991, -0.24399791657925, 0.25148370862007, -0.25792515277863, 0.2632472217083, -0.2673873603344, 0.27029666304588, -0.27194058895111, 0.27229961752892, -0.27136951684952, 0.26916137337685, -0.26570156216621, 0.26103109121323, -0.2552050948143, 0.24829186499119, -0.2403716146946, 0.23153533041477, -0.22188314795494, 0.21152280271053, -0.20056788623333, 0.18913607299328, -0.17734721302986, 0.1653216034174, -0.15317812561989, 3322.1689453125, 293.0, 32.0, -0.15418101847172, 0.16600094735622, -0.17770238220692, 0.18917547166348, -0.20030918717384, 0.21099291741848, -0.22111804783344, 0.23057958483696, -0.23927773535252, 0.24711936712265, -0.25401946902275, 0.2599024772644, -0.26470339298248, 0.26836889982224, -0.2708580493927, 0.27214300632477, -0.27220949530602, 0.27105695009232, -0.26869857311249, 0.26516109704971, -0.26048436760902, 0.25472068786621, -0.24793407320976, 0.24019911885262, -0.23159992694855, 0.22222879528999, -0.21218475699425, 0.20157214999199, -0.19049900770187, 0.17907544970512, -0.16741213202477, 0.1556186825037, 3419.5158691406, 302.0, 32.0, 0.15886119008064, -0.17032350599766, 0.18163554370403, -0.19269575178623, 0.20340207219124, -0.21365320682526, 0.22335013747215, -0.23239740729332, 0.24070453643799, -0.24818730354309, 0.25476893782616, -0.26038128137589, 0.26496580243111, -0.26847431063652, 0.27086988091469, -0.27212730050087, 0.27223336696625, -0.27118724584579, 0.26900029182434, -0.26569604873657, 0.26130974292755, -0.25588783621788, 0.24948740005493, -0.2421750575304, 0.23402620851994, -0.2251238077879, 0.21555718779564, -0.20542080700397, 0.19481287896633, -0.18383395671844, 0.1725856512785, -0.16116914153099, 3519.7153320312, 311.0, 33.0, -0.16058138012886, 0.17170080542564, -0.18266707658768, 0.19338700175285, -0.20376706123352, 0.21371449530125, -0.22313857078552, 0.23195177316666, -0.24007096886635, 0.2474185526371, -0.25392347574234, 0.25952216982841, -0.2641596198082, 0.26778990030289, -0.27037692070007, 0.27189499139786, -0.27232897281647, 0.27167481184006, -0.26993924379349, 0.26713997125626, -0.26330518722534, 0.25847339630127, -0.25269266963005, 0.24602007865906, -0.23852089047432, 0.23026764392853, -0.22133912146091, 0.21181933581829, -0.20179633796215, 0.19136108458042, -0.18060623109341, 0.16962490975857, -0.15850958228111, 3622.8510742188, 320.0, 34.0, 0.15952277183533, -0.17032097280025, 0.18098635971546, -0.19143395125866, 0.20157825946808, -0.21133430302143, 0.22061863541603, -0.22935037314892, 0.2374522536993, -0.24485155940056, 0.2514810860157, -0.25728005170822, 0.26219475269318, -0.2661794424057, 0.26919677853584, -0.27121841907501, 0.27222535014153, -0.27220818400383, 0.27116712927818, -0.26911225914955, 0.26606306433678, -0.26204845309258, 0.25710615515709, -0.25128242373466, 0.24463127553463, -0.23721379041672, 0.22909738123417, -0.22035491466522, 0.21106369793415, -0.20130458474159, 0.1911609172821, -0.1807175129652, 0.17005959153175, -0.1592718064785, 3729.0085449219, 329.0, 36.0, -0.15588000416756, 0.16636693477631, -0.17675887048244, 0.18697893619537, -0.19694939255714, 0.20659254491329, -0.21583162248135, 0.22459162771702, -0.23280024528503, 0.24038872122765, -0.24729265272617, 0.25345277786255, -0.25881567597389, 0.26333454251289, -0.26696959137917, 0.26968863606453, -0.27146753668785, 0.2722904086113, -0.27214992046356, 0.27104726433754, -0.2689922451973, 0.26600316166878, -0.26210641860962, 0.25733643770218, -0.25173506140709, 0.24535104632378, -0.23823952674866, 0.23046132922173, -0.22208216786385, 0.21317191421986, -0.20380374789238, 0.19405324757099, -0.18399757146835, 0.17371453344822, -0.16328172385693, 0.15277564525604, 3838.2768554688, 339.0, 36.0, -0.15915779769421, 0.16936759650707, -0.17946599423885, 0.18938140571117, -0.19904166460037, 0.20837485790253, -0.21731005609035, 0.22577819228172, -0.23371271789074, 0.24105043709278, -0.24773217737675, 0.25370353460312, -0.2589153945446, 0.26332464814186, -0.26689457893372, 0.26959535479546, -0.27140429615974, 0.27230632305145, -0.27229389548302, 0.27136731147766, -0.26953452825546, 0.26681125164032, -0.26322051882744, 0.25879266858101, -0.25356474518776, 0.24758023023605, -0.24088847637177, 0.23354411125183, -0.22560641169548, 0.21713861823082, -0.20820724964142, 0.19888128340244, -0.18923147022724, 0.17932945489883, -0.16924707591534, 0.15905559062958, 3950.7470703125, 349.0, 37.0, -0.15960973501205, 0.169543415308, -0.1793692111969, 0.18902115523815, -0.19843284785748, 0.20753806829453, -0.21627153456211, 0.22456948459148, -0.23237045109272, 0.23961581289768, -0.24625055491924, 0.25222373008728, -0.25748908519745, 0.26200559735298, -0.26573783159256, 0.26865646243095, -0.27073842287064, 0.27196738123894, -0.27233371138573, 0.27183470129967, -0.27047461271286, 0.26826450228691, -0.26522228121758, 0.26137229800224, -0.25674524903297, 0.25137770175934, -0.24531173706055, 0.23859453201294, -0.23127773404121, 0.22341698408127, -0.21507124602795, 0.20630224049091, -0.19717371463776, 0.18775084614754, -0.17809948325157, 0.1682855784893, -0.15837441384792, 4066.5126953125, 359.0, 39.0, -0.15815950930119, 0.16775777935982, -0.17726802825928, 0.18663102388382, -0.19578693807125, 0.20467595756054, -0.21323885023594, 0.22141750156879, -0.22915548086166, 0.23639866709709, -0.24309575557709, 0.24919871985912, -0.2546634376049, 0.25944998860359, -0.26352319121361, 0.26685291528702, -0.26941439509392, 0.27118846774101, -0.27216190099716, 0.27232730388641, -0.27168339490891, 0.27023500204086, -0.26799288392067, 0.26497372984886, -0.26120001077652, 0.25669959187508, -0.25150561332703, 0.24565601348877, -0.23919323086739, 0.23216371238232, -0.22461746633053, 0.21660751104355, -0.20818941295147, 0.19942064583302, -0.19036011397839, 0.18106749653816, -0.17160272598267, 0.16202540695667, -0.15239422023296, 4185.6704101562, 369.0, 40.0, -0.15326450765133, 0.16261520981789, -0.17191319167614, 0.18110457062721, -0.1901346296072, 0.19894833862782, -0.20749087631702, 0.21570806205273, -0.2235468775034, 0.23095600306988, -0.23788623511791, 0.24429102241993, -0.2501268684864, 0.25535374879837, -0.25993555784225, 0.26384037733078, -0.26704087853432, 0.26951450109482, -0.27124375104904, 0.27221637964249, -0.27242544293404, 0.27186939120293, -0.27055209875107, 0.26848289370537, -0.26567628979683, 0.26215204596519, -0.25793477892876, 0.25305393338203, -0.24754324555397, 0.2414406388998, -0.23478770256042, 0.22762936353683, -0.22001342475414, 0.21199008822441, -0.2036115527153, 0.19493144750595, -0.18600437045097, 0.17688535153866, -0.16762942075729, 0.1582910567522, 4308.3203125, 380.0, 41.0, 0.15518039464951, -0.16424360871315, 0.1732479184866, -0.18214403092861, 0.19088195264339, -0.19941154122353, 0.2076828032732, -0.21564635634422, 0.223253890872, -0.23045858740807, 0.23721547424793, -0.2434818893671, 0.24921788275242, -0.25438648462296, 0.25895413756371, -0.26289096474648, 0.26617109775543, -0.26877278089523, 0.27067875862122, -0.27187630534172, 0.27235734462738, -0.27211865782738, 0.27116170525551, -0.26949286460876, 0.26712313294411, -0.26406815648079, 0.26034805178642, -0.25598725676537, 0.25101426243782, -0.24546131491661, 0.23936420679092, -0.23276188969612, 0.22569614648819, -0.21821118891239, 0.21035328507423, -0.20217032730579, 0.19371144473553, -0.18502651154995, 0.17616580426693, -0.16717949509621, 0.15811727941036, 4434.5634765625, 391.0, 43.0, -0.15328204631805, 0.16214951872826, -0.17097046971321, 0.17969906330109, -0.18828880786896, 0.19669295847416, -0.20486479997635, 0.21275816857815, -0.22032769024372, 0.22752922773361, -0.23432025313377, 0.2406602203846, -0.24651086330414, 0.25183653831482, -0.2566045820713, 0.26078554987907, -0.26435345411301, 0.2672860622406, -0.26956504583359, 0.27117612957954, -0.2721092402935, 0.27235859632492, -0.27192270755768, 0.27080452442169, -0.26901119947433, 0.26655423641205, -0.26344919204712, 0.25971576571465, -0.25537732243538, 0.25046101212502, -0.24499727785587, 0.23901967704296, -0.2325646430254, 0.22567108273506, -0.21838009357452, 0.21073459088802, -0.20277893543243, 0.19455860555172, -0.18611977994442, 0.1775089353323, -0.16877256333828, 0.15995672345161, -0.15110670030117, 4564.5063476562, 403.0, 43.0, -0.15831726789474, 0.16688796877861, -0.17539343237877, 0.18379160761833, -0.19203996658325, 0.20009590685368, -0.20791700482368, 0.21546137332916, -0.22268798947334, 0.22955699265003, -0.23603004217148, 0.24207058548927, -0.24764417111874, 0.25271874666214, -0.25726488232613, 0.26125603914261, -0.26466876268387, 0.26748296618462, -0.26968193054199, 0.27125263214111, -0.27218574285507, 0.27247565984726, -0.2721206843853, 0.2711229622364, -0.26948845386505, 0.26722696423531, -0.26435190439224, 0.26088035106659, -0.25683277845383, 0.25223299860954, -0.24710783362389, 0.24148699641228, -0.23540280759335, 0.22888992726803, -0.22198508679867, 0.21472679078579, -0.20715498924255, 0.19931077957153, -0.19123606383801, 0.18297328054905, -0.17456498742104, 0.16605360805988, -0.15748110413551, 4698.2563476562, 414.0, 45.0, 0.15110519528389, -0.15949182212353, 0.16784951090813, -0.17613980174065, 0.18432356417179, -0.19236136972904, 0.20021370053291, -0.20784124732018, 0.21520522236824, -0.2222676128149, 0.22899150848389, -0.2353413105011, 0.2412830889225, -0.24678476154804, 0.25181639194489, -0.25635042786598, 0.26036185026169, -0.26382848620415, 0.26673096418381, -0.26905319094658, 0.27078220248222, -0.27190831303596, 0.27242535352707, -0.27233049273491, 0.27162444591522, -0.27031138539314, 0.26839885115623, -0.26589781045914, 0.26282244920731, -0.25919020175934, 0.25502145290375, -0.250339448452, 0.24517016112804, -0.23954202234745, 0.23348566889763, -0.2270338088274, 0.22022087872028, -0.21308283507824, 0.20565682649612, -0.19798097014427, 0.19009403884411, -0.18203517794609, 0.17384365200996, -0.1655584871769, 0.1572183072567, 4835.92578125, 426.0, 47.0, 0.15083719789982, -0.15892684459686, 0.16699239611626, -0.17499932646751, 0.18291257321835, -0.19069671630859, 0.19831618666649, -0.20573557913303, 0.21291980147362, -0.21983440220356, 0.22644576430321, -0.23272131383419, 0.23862981796265, -0.24414156377316, 0.24922856688499, -0.25386482477188, 0.2580264210701, -0.26169180870056, 0.26484182476997, -0.26746001839638, 0.26953259110451, -0.27104860544205, 0.27200004458427, -0.27238181233406, 0.27219194173813, -0.27143135666847, 0.27010408043861, -0.26821711659431, 0.26578035950661, -0.26280665397644, 0.2593115568161, -0.25531324744225, 0.25083249807358, -0.24589242041111, 0.24051830172539, -0.23473745584488, 0.22857904434204, -0.22207379341125, 0.21525384485722, -0.20815247297287, 0.20080392062664, -0.19324305653572, 0.18550525605679, -0.17762605845928, 0.1696409881115, -0.16158528625965, 0.15349371731281, 4977.6293945312, 439.0, 48.0, -0.15468917787075, 0.16255755722523, -0.17038825154305, 0.17814922332764, -0.18580794334412, 0.1933316886425, -0.20068770647049, 0.20784343779087, -0.21476669609547, 0.22142593562603, -0.2277903854847, 0.23383033275604, -0.23951725661755, 0.24482406675816, -0.24972526729107, 0.25419709086418, -0.25821778178215, 0.26176762580872, -0.26482912898064, 0.26738712191582, -0.26942893862724, 0.27094438672066, -0.2719259262085, 0.27236869931221, -0.27227047085762, 0.27163177728653, -0.27045583724976, 0.26874858140945, -0.26651850342751, 0.2637767791748, -0.26053699851036, 0.25681525468826, -0.25262987613678, 0.24800130724907, -0.2429521381855, 0.23750673234463, -0.23169119656086, 0.22553315758705, -0.21906158328056, 0.21230654418468, -0.20529907941818, 0.19807097315788, -0.19065451622009, 0.1830823123455, -0.17538705468178, 0.16760139167309, -0.15975759923458, 0.15188750624657, 5123.4848632812, 452.0, 49.0, 0.15564964711666, -0.16329799592495, 0.17090781033039, -0.17844957113266, 0.18589337170124, -0.193209156394, 0.20036679506302, -0.20733636617661, 0.21408827602863, -0.22059348225594, 0.22682362794876, -0.23275125026703, 0.23834997415543, -0.24359464645386, 0.24846148490906, -0.25292825698853, 0.25697448849678, -0.26058146357536, 0.26373237371445, -0.26641261577606, 0.26860958337784, -0.27031296491623, 0.27151483297348, -0.27220946550369, 0.27239367365837, -0.27206656336784, 0.27122980356216, -0.26988732814789, 0.26804554462433, -0.26571318507195, 0.2629012465477, -0.25962290167809, 0.25589352846146, -0.25173047184944, 0.24715296924114, -0.24218206107616, 0.23684044182301, -0.2311522513628, 0.22514303028584, -0.21883943676949, 0.21226915717125, -0.20546072721481, 0.19844329357147, -0.191246509552, 0.18390029668808, -0.17643468081951, 0.1688796132803, -0.16126482188702, 0.15361957252026, 5273.6147460938, 465.0, 51.0, -0.15388002991676, 0.16131319105625, -0.16871720552444, 0.17606514692307, -0.18332973122597, 0.19048342108727, -0.19749863445759, 0.20434783399105, -0.21100378036499, 0.21743960678577, -0.22362899780273, 0.2295463681221, -0.23516699671745, 0.24046717584133, -0.24542434513569, 0.25001725554466, -0.25422608852386, 0.25803253054619, -0.26141998171806, 0.26437357068062, -0.26688027381897, 0.26892903447151, -0.27051079273224, 0.27161851525307, -0.2722472846508, 0.27239435911179, -0.27205911278725, 0.27124306559563, -0.26994988322258, 0.26818537712097, -0.26595741510391, 0.26327595114708, -0.26015284657478, 0.25660187005997, -0.25263866782188, 0.24828051030636, -0.24354635179043, 0.23845660686493, -0.2330330312252, 0.2272986471653, -0.22127754986286, 0.21499481797218, -0.20847629010677, 0.20174846053123, -0.19483831524849, 0.18777316808701, -0.18058052659035, 0.17328788340092, -0.16592261195183, 0.15851181745529, -0.15108214318752, 5428.1430664062, 479.0, 52.0, -0.15677626430988, 0.16397923231125, -0.17114588618279, 0.17825153470039, -0.18527114391327, 0.19217956066132, -0.19895157217979, 0.20556208491325, -0.21198625862598, 0.21819962561131, -0.22417820990086, 0.22989872097969, -0.23533861339092, 0.24047626554966, -0.24529108405113, 0.24976359307766, -0.25387561321259, 0.2576102912426, -0.26095229387283, 0.2638877928257, -0.26640456914902, 0.26849216222763, -0.2701418697834, 0.27134674787521, -0.27210175991058, 0.27240371704102, -0.27225139737129, 0.27164545655251, -0.27058842778206, 0.26908478140831, -0.26714083552361, 0.26476469635963, -0.2619663476944, 0.25875741243362, -0.2551511824131, 0.25116255879402, -0.24680788815022, 0.24210493266582, -0.23707275092602, 0.23173154890537, -0.22610265016556, 0.22020825743675, -0.21407145261765, 0.20771595835686, -0.2011660784483, 0.19444651901722, -0.18758228421211, 0.18059852719307, -0.17352040112019, 0.16637295484543, -0.15918098390102, 0.15196891129017, 5587.2001953125, 493.0, 53.0, -0.15687412023544, 0.16385194659233, -0.17079634964466, 0.17768485844135, -0.18449473381042, 0.19120307266712, -0.19778697192669, 0.20422352850437, -0.21049009263515, 0.21656429767609, -0.22242419421673, 0.22804835438728, -0.23341602087021, 0.23850718140602, -0.24330271780491, 0.24778443574905, -0.25193524360657, 0.25573915243149, -0.25918152928352, 0.2622489631176, -0.26492947340012, 0.26721253991127, -0.26908922195435, 0.27055209875107, -0.27159535884857, 0.27221485972404, -0.27240812778473, 0.27217438817024, -0.27151453495026, 0.2704311311245, -0.26892843842506, 0.26701238751411, -0.26469045877457, 0.26197174191475, -0.25886687636375, 0.2553878724575, -0.25154826045036, 0.24736282229424, -0.2428475767374, 0.23801970481873, -0.23289749026299, 0.22750014066696, -0.22184772789478, 0.2159610837698, -0.20986169576645, 0.20357155799866, -0.19711309671402, 0.1905090212822, -0.1837822496891, 0.17695574462414, -0.17005242407322, 0.16309505701065, -0.15610612928867, 5750.9174804688, 507.0, 55.0, -0.15296176075935, 0.15980744361877, -0.16663330793381, 0.1734184473753, -0.18014162778854, 0.18678142130375, -0.19331631064415, 0.19972477853298, -0.20598542690277, 0.21207703649998, -0.21797876060009, 0.22367013990879, -0.2291312366724, 0.23434275388718, -0.23928610980511, 0.24394354224205, -0.24829821288586, 0.25233426690102, -0.25603690743446, 0.25939252972603, -0.26238870620728, 0.2650143802166, -0.26725980639458, 0.26911655068398, -0.27057778835297, 0.27163803577423, -0.27229338884354, 0.27254146337509, -0.27238139510155, 0.27181386947632, -0.27084112167358, 0.26946693658829, -0.26769655942917, 0.26553672552109, -0.2629956305027, 0.26008287072182, -0.25680938363075, 0.25318738818169, -0.24923031032085, 0.24495278298855, -0.24037048220634, 0.2355000525713, -0.23035910725594, 0.22496603429317, -0.21933996677399, 0.21350063383579, -0.20746831595898, 0.2012637257576, -0.1949078887701, 0.18842202425003, -0.18182750046253, 0.17514568567276, -0.16839784383774, 0.16160507500172, -0.15478816628456, 5919.4321289062, 522.0, 57.0, 0.15450903773308, -0.16111998260021, 0.16770945489407, -0.17425855994225, 0.18074806034565, -0.18715859949589, 0.19347070157528, -0.19966492056847, 0.2057218849659, -0.21162238717079, 0.21734748780727, -0.2228786200285, 0.22819763422012, -0.23328691720963, 0.23812945187092, -0.24270893633366, 0.24700982868671, -0.25101742148399, 0.25471791625023, -0.25809854269028, 0.2611475288868, -0.26385426521301, 0.26620921492577, -0.26820412278175, 0.26983192563057, -0.27108690142632, 0.27196460962296, -0.27246186137199, 0.27257698774338, -0.27230948209763, 0.2716603577137, -0.2706318795681, 0.26922771334648, -0.26745280623436, 0.26531338691711, -0.26281705498695, 0.25997254252434, -0.25678977370262, 0.25327986478806, -0.24945499002934, 0.24532830715179, -0.24091398715973, 0.23622706532478, -0.23128339648247, 0.22609956562519, -0.22069285809994, 0.21508106589317, -0.20928254723549, 0.20331601798534, -0.19720052182674, 0.19095534086227, -0.18459990620613, 0.17815367877483, -0.17163608968258, 0.16506646573544, -0.15846392512321, 0.15184727311134, 6092.884765625, 537.0, 59.0, -0.15212407708168, 0.15857574343681, -0.16501265764236, 0.17141737043858, -0.17777220904827, 0.18405927717686, -0.19026063382626, 0.19635826349258, -0.2023342102766, 0.20817066729069, -0.21385000646114, 0.2193548977375, -0.22466835379601, 0.22977381944656, -0.2346552759409, 0.23929725587368, -0.24368494749069, 0.2478042691946, -0.25164189934731, 0.2551853954792, -0.25842314958572, 0.26134461164474, -0.26394012570381, 0.2662011384964, -0.26812019944191, 0.26969093084335, -0.27090817689896, 0.27176785469055, -0.27226719260216, 0.27240455150604, -0.27217948436737, 0.27159285545349, -0.27064669132233, 0.26934415102005, -0.26768970489502, 0.26568892598152, -0.26334848999977, 0.26067626476288, -0.25768110156059, 0.25437295436859, -0.25076270103455, 0.24686220288277, -0.24268414080143, 0.23824205994606, -0.23355023562908, 0.22862364351749, -0.22347785532475, 0.21812902390957, -0.2125937640667, 0.20688909292221, -0.2010323703289, 0.19504119455814, -0.18893332779408, 0.18272663652897, -0.17643904685974, 0.17008835077286, -0.1636922955513, 0.15726837515831, -0.15083381533623, 6271.419921875, 553.0, 60.0, -0.15330308675766, 0.15960586071014, -0.16589179635048, 0.17214459180832, -0.1783477216959, 0.18448454141617, -0.19053830206394, 0.19649222493172, -0.20232962071896, 0.20803388953209, -0.21358865499496, 0.21897777915001, -0.22418543696404, 0.22919623553753, -0.23399521410465, 0.23856794834137, -0.24290059506893, 0.24697993695736, -0.25079351663589, 0.25432959198952, -0.25757721066475, 0.26052632927895, -0.26316779851913, 0.26549333333969, -0.26749575138092, 0.2691687643528, -0.27050718665123, 0.2715068757534, -0.27216479182243, 0.2724789083004, -0.27244836091995, 0.27207338809967, -0.27135533094406, 0.27029654383659, -0.26890057325363, 0.26717194914818, -0.26511630415916, 0.26274025440216, -0.26005139946938, 0.25705832242966, -0.25377050042152, 0.25019827485085, -0.24635285139084, 0.2422461360693, -0.23789085447788, 0.2333003282547, -0.22848850488663, 0.22346991300583, -0.21825951337814, 0.21287274360657, -0.20732533931732, 0.20163337886333, -0.19581313431263, 0.18988102674484, -0.18385358154774, 0.17774733901024, -0.17157876491547, 0.16536426544189, -0.15912002325058, 0.15286201238632, 6455.1865234375, 569.0, 62.0, -0.15306161344051, 0.15912744402885, -0.16518013179302, 0.17120514810085, -0.1771877259016, 0.18311300873756, -0.18896597623825, 0.19473162293434, -0.20039491355419, 0.20594094693661, -0.21135486662388, 0.21662209928036, -0.22172826528549, 0.22665928304195, -0.23140145838261, 0.2359414845705, -0.24026656150818, 0.24436435103416, -0.2482231259346, 0.25183179974556, -0.25517988204956, 0.25825762748718, -0.26105603575706, 0.26356688141823, -0.26578280329704, 0.26769721508026, -0.26930445432663, 0.27059975266457, -0.27157923579216, 0.27224001288414, -0.27258008718491, 0.27259847521782, -0.27229508757591, 0.2716708779335, -0.27072769403458, 0.26946833729744, -0.26789656281471, 0.26601707935333, -0.26383543014526, 0.26135808229446, -0.25859236717224, 0.25554636120796, -0.25222903490067, 0.24864999949932, -0.24481968581676, 0.24074910581112, -0.23644994199276, 0.23193442821503, -0.2272153198719, 0.22230586409569, -0.2172197252512, 0.21197092533112, -0.20657376945019, 0.20104287564754, -0.19539301097393, 0.18963907659054, -0.18379607796669, 0.17787903547287, -0.17190293967724, 0.16588267683983, -0.15983299911022, 0.15376845002174, 6644.337890625, 586.0, 64.0, 0.15490557253361, -0.16079965233803, 0.16667668521404, -0.17252327501774, 0.17832589149475, -0.18407082557678, 0.18974433839321, -0.19533267617226, 0.2008221000433, -0.20619893074036, 0.21144965291023, -0.21656088531017, 0.221519485116, -0.22631262242794, 0.23092773556709, -0.23535265028477, 0.2395756393671, -0.24358536303043, 0.24737107753754, -0.25092250108719, 0.25422996282578, -0.25728446245193, 0.26007759571075, -0.26260164380074, 0.26484966278076, -0.26681542396545, 0.26849341392517, -0.26987901329994, 0.27096834778786, -0.27175840735435, 0.27224695682526, -0.27243265509605, 0.27231502532959, -0.27189439535141, 0.27117195725441, -0.27014982700348, 0.26883080601692, -0.26721867918968, 0.26531791687012, -0.26313388347626, 0.26067265868187, -0.25794106721878, 0.25494667887688, -0.25169774889946, 0.24820320308208, -0.24447256326675, 0.24051597714424, -0.2363440990448, 0.23196813464165, -0.22739972174168, 0.22265094518661, -0.2177342325449, 0.21266235411167, -0.2074483782053, 0.20210559666157, -0.19664746522903, 0.19108757376671, -0.18543963134289, 0.17971734702587, -0.17393442988396, 0.16810451447964, -0.16224114596844, 0.15635769069195, -0.15046735107899, 6839.0317382812, 603.0, 66.0, -0.15374322235584, 0.1594861894846, -0.16521643102169, 0.1709215939045, -0.17658917605877, 0.18220654129982, -0.18776100873947, 0.19323982298374, -0.19863025844097, 0.20391963422298, -0.20909535884857, 0.21414498984814, -0.21905626356602, 0.22381711006165, -0.22841578722, 0.2328408062458, -0.23708106577396, 0.24112582206726, -0.24496477842331, 0.24858812987804, -0.2519865334034, 0.2551511824131, -0.25807389616966, 0.26074701547623, -0.26316356658936, 0.26531720161438, -0.26720225811005, 0.26881378889084, -0.27014753222466, 0.27119997143745, -0.27196833491325, 0.27245062589645, -0.27264556288719, 0.27255269885063, -0.27217227220535, 0.27150538563728, -0.27055382728577, 0.26932016015053, -0.267807751894, 0.26602059602737, -0.26396352052689, 0.26164194941521, -0.25906208157539, 0.25623068213463, -0.25315523147583, 0.24984377622604, -0.24630491435528, 0.24254782497883, -0.23858216404915, 0.23441809415817, -0.23006618022919, 0.22553738951683, -0.22084307670593, 0.21599489450455, -0.21100474894047, 0.20588479936123, -0.20064739882946, 0.19530503451824, -0.18987031280994, 0.18435588479042, -0.17877441644669, 0.17313855886459, -0.16746088862419, 0.16175386309624, -0.1560298204422, 0.15030087530613, 7039.4306640625, 620.0, 68.0, 0.15018704533577, -0.15575586259365, 0.16131953895092, -0.16686697304249, 0.17238683998585, -0.17786778509617, 0.18329825997353, -0.18866671621799, 0.19396157562733, -0.19917125999928, 0.2042842656374, -0.20928913354874, 0.21417458355427, -0.21892945468426, 0.22354282438755, -0.22800397872925, 0.23230248689651, -0.23642821609974, 0.24037137627602, -0.24412257969379, 0.24767279624939, -0.25101348757744, 0.25413650274277, -0.25703430175781, 0.25969976186752, -0.26212632656097, 0.26430806517601, -0.26623958349228, 0.26791608333588, -0.26933342218399, 0.2704881131649, -0.27137726545334, 0.27199870347977, -0.2723508477211, 0.27243289351463, -0.27224463224411, 0.27178654074669, -0.27105984091759, 0.27006632089615, -0.26880851387978, 0.26728954911232, -0.26551327109337, 0.26348409056664, -0.2612070441246, 0.25868782401085, -0.25593262910843, 0.25294822454453, -0.24974194169044, 0.24632160365582, -0.2426954805851, 0.2388723641634, -0.23486138880253, 0.23067213594913, -0.22631451487541, 0.2217987626791, -0.21713541448116, 0.21233524382114, -0.20740926265717, 0.20236863195896, -0.19722470641136, 0.19198888540268, -0.18667268753052, 0.1812876611948, -0.17584531009197, 0.17035715281963, -0.16483460366726, 0.15928895771503, -0.15373137593269, 7245.7021484375, 639.0, 69.0, -0.15476040542126, 0.1601694971323, -0.16556625068188, 0.17094035446644, -0.17628130316734, 0.18157857656479, -0.18682152032852, 0.19199949502945, -0.19710183143616, 0.20211787521839, -0.20703707635403, 0.21184895932674, -0.21654316782951, 0.22110950946808, -0.22553800046444, 0.22981886565685, -0.23394256830215, 0.23789989948273, -0.24168191850185, 0.24528007209301, -0.24868614971638, 0.25189232826233, -0.25489124655724, 0.25767594575882, -0.26023998856544, 0.26257741451263, -0.26468271017075, 0.26655098795891, -0.26817783713341, 0.26955944299698, -0.2706925868988, 0.27157452702522, -0.27220326662064, 0.2725772857666, -0.27269569039345, 0.27255827188492, -0.27216535806656, 0.27151787281036, -0.27061739563942, 0.26946604251862, -0.26806661486626, 0.26642239093781, -0.26453730463982, 0.262415766716, -0.26006278395653, 0.25748389959335, -0.25468510389328, 0.25167298316956, -0.24845443665981, 0.24503694474697, -0.24142834544182, 0.23763684928417, -0.23367108404636, 0.22953999042511, -0.22525282204151, 0.22081908583641, -0.21624858677387, 0.2115513086319, -0.20673744380474, 0.20181731879711, -0.19680140912533, 0.19170026481152, -0.18652446568012, 0.18128468096256, -0.17599150538445, 0.17065554857254, -0.16528730094433, 0.15989720821381, -0.15449553728104, 7458.0170898438, 657.0, 72.0, -0.15147867798805, 0.1567121297121, -0.16193959116936, 0.16715179383755, -0.17233936488628, 0.17749281227589, -0.18260259926319, 0.18765909969807, -0.19265270233154, 0.19757376611233, -0.20241269469261, 0.20715995132923, -0.21180610358715, 0.21634179353714, -0.22075782716274, 0.22504518926144, -0.22919502854347, 0.23319873213768, -0.23704795539379, 0.24073456227779, -0.24425077438354, 0.24758909642696, -0.250742405653, 0.25370389223099, -0.2564671933651, 0.25902631878853, -0.26137566566467, 0.2635101377964, -0.2654250562191, 0.26711618900299, -0.26857987046242, 0.26981282234192, -0.27081236243248, 0.27157625555992, -0.27210280299187, 0.27239087224007, -0.2724397778511, 0.27224946022034, -0.27182030677795, 0.2711533010006, -0.27024987339973, 0.26911208033562, -0.26774242520332, 0.26614388823509, -0.26432004570961, 0.26227486133575, -0.26001283526421, 0.2575389444828, -0.25485852360725, 0.25197741389275, -0.24890185892582, 0.24563845992088, -0.2421942204237, 0.23857648670673, -0.23479291796684, 0.23085150122643, -0.22676047682762, 0.2225283831358, -0.21816393733025, 0.21367609500885, -0.20907399058342, 0.20436689257622, -0.19956420361996, 0.19467543065548, -0.18971011042595, 0.18467789888382, -0.17958837747574, 0.174451187253, -0.16927587985992, 0.16407199203968, -0.15884892642498, 0.15361598134041, 7676.5537109375, 677.0, 73.0, -0.15404012799263, 0.15917068719864, -0.16429074108601, 0.16939152777195, -0.17446415126324, 0.17949967086315, -0.18448907136917, 0.18942332267761, -0.19429336488247, 0.19909016788006, -0.20380473136902, 0.20842815935612, -0.21295158565044, 0.21736632287502, -0.22166375815868, 0.22583550214767, -0.22987331449986, 0.2337691783905, -0.23751531541348, 0.24110418558121, -0.24452854692936, 0.24778142571449, -0.2508562207222, 0.25374659895897, -0.25644662976265, 0.25895076990128, -0.26125380396843, 0.26335096359253, -0.26523789763451, 0.26691067218781, -0.26836583018303, 0.26960030198097, -0.27061155438423, 0.27139747142792, -0.2719564139843, 0.27228727936745, -0.27238935232162, 0.27226248383522, -0.27190700173378, 0.27132365107536, -0.27051374316216, 0.26947900652885, -0.26822170615196, 0.26674446463585, -0.26505050063133, 0.26314336061478, -0.26102709770203, 0.25870618224144, -0.25618544220924, 0.25347018241882, -0.25056603550911, 0.24747902154922, -0.24421548843384, 0.24078215658665, -0.23718599975109, 0.23343430459499, -0.2295346558094, 0.2254948168993, -0.22132284939289, 0.21702696382999, -0.21261556446552, 0.20809721946716, -0.20348060131073, 0.19877451658249, -0.19398784637451, 0.18912950158119, -0.18420846760273, 0.17923371493816, -0.17421421408653, 0.16915886104107, -0.16407652199268, 0.15897597372532, -0.15386588871479, 7901.494140625, 696.0, 76.0, 0.15037716925144, -0.15535575151443, 0.16033144295216, -0.16529628634453, 0.17024226486683, -0.17516121268272, 0.18004494905472, -0.18488521873951, 0.18967372179031, -0.19440217316151, 0.19906230270863, -0.20364584028721, 0.20814462006092, -0.21255052089691, 0.21685552597046, -0.22105173766613, 0.22513139247894, -0.22908692061901, 0.2329108864069, -0.23659609258175, 0.2401355355978, -0.2435224801302, 0.24675042927265, -0.24981315433979, 0.25270473957062, -0.25541958212852, 0.25795239210129, -0.26029822230339, 0.26245245337486, -0.26441088318825, 0.26616966724396, -0.26772531867027, 0.26907476782799, -0.27021539211273, 0.271144926548, -0.27186155319214, 0.27236387133598, -0.27265092730522, 0.27272215485573, -0.27257746458054, 0.27221718430519, -0.27164205908775, 0.27085331082344, -0.26985254883766, 0.26864179968834, -0.26722350716591, 0.26560056209564, -0.26377621293068, 0.26175412535667, -0.25953832268715, 0.25713318586349, -0.25454354286194, 0.25177443027496, -0.24883131682873, 0.24571993947029, -0.24244636297226, 0.23901690542698, -0.23543813824654, 0.23171693086624, -0.22786033153534, 0.22387562692165, -0.21977025270462, 0.21555185317993, -0.21122819185257, 0.20680719614029, -0.20229685306549, 0.1977052539587, -0.19304056465626, 0.18831098079681, -0.18352472782135, 0.17869001626968, -0.17381505668163, 0.16890799999237, -0.16397695243359, 0.15902993083, -0.15407484769821, 8133.025390625, 717.0, 78.0, -0.15427805483341, 0.15906934440136, -0.16385217010975, 0.16861934959888, -0.17336367070675, 0.1780778169632, -0.18275444209576, 0.18738617002964, -0.19196559488773, 0.19648532569408, -0.20093797147274, 0.20531620085239, -0.20961271226406, 0.21382030844688, -0.21793186664581, 0.22194035351276, -0.2258388698101, 0.22962068021297, -0.23327918350697, 0.2368079572916, -0.24020077288151, 0.24345162510872, -0.24655468761921, 0.24950443208218, -0.25229552388191, 0.25492289662361, -0.25738182663918, 0.25966781377792, -0.2617766559124, 0.26370453834534, -0.26544788479805, 0.26700347661972, -0.2683684527874, 0.26954030990601, -0.27051684260368, 0.27129623293877, -0.2718770802021, 0.27225825190544, -0.27243909239769, 0.27241921424866, -0.27219870686531, 0.27177792787552, -0.27115771174431, 0.27033916115761, -0.26932382583618, 0.26811355352402, -0.26671066880226, 0.26511767506599, -0.26333755254745, 0.26137357950211, -0.25922936201096, 0.25690883398056, -0.25441619753838, 0.25175604224205, -0.24893315136433, 0.24595263600349, -0.24281984567642, 0.23954039812088, -0.23612014949322, 0.23256511986256, -0.22888161242008, 0.22507604956627, -0.22115507721901, 0.21712544560432, -0.21299409866333, 0.20876805484295, -0.20445446670055, 0.20006054639816, -0.19559361040592, 0.19106097519398, -0.18647003173828, 0.18182817101479, -0.1771427989006, 0.17242127656937, -0.16767095029354, 0.16289910674095, -0.15811294317245, 0.15331961214542, 8371.3408203125, 738.0, 80.0, 0.15328025817871, -0.15796862542629, 0.16265016794205, -0.16731818020344, 0.17196594178677, -0.17658662796021, 0.18117338418961, -0.18571931123734, 0.19021750986576, -0.19466106593609, 0.19904306530952, -0.20335666835308, 0.20759502053261, -0.21175137162209, 0.2158190459013, -0.21979141235352, 0.22366201877594, -0.22742448747158, 0.2310725748539, -0.23460021615028, 0.23800149559975, -0.24127069115639, 0.2444022744894, -0.24739089608192, 0.25023147463799, -0.25291913747787, 0.25544926524162, -0.25781744718552, 0.26001963019371, -0.26205196976662, 0.26391094923019, -0.26559329032898, 0.26709607243538, -0.26841667294502, 0.26955279707909, -0.27050241827965, 0.27126389741898, -0.27183589339256, 0.27221742272377, -0.27240782976151, 0.27240681648254, -0.27221435308456, 0.27183085680008, -0.2712570130825, 0.27049380540848, -0.2695426940918, 0.26840528845787, -0.26708370447159, 0.26558023691177, -0.26389753818512, 0.26203861832619, -0.26000672578812, 0.25780546665192, -0.25543862581253, 0.25291040539742, -0.25022512674332, 0.24738746881485, -0.24440230429173, 0.24127475917339, -0.2380101531744, 0.23461404442787, -0.23109215497971, 0.22745037078857, -0.22369478642941, 0.21983161568642, -0.21586720645428, 0.21180802583694, -0.20766066014767, 0.20343178510666, -0.19912810623646, 0.19475644826889, -0.19032362103462, 0.18583650887012, -0.18130196630955, 0.17672687768936, -0.17211806774139, 0.16748237609863, -0.1628265529871, 0.15815728902817, -0.15348121523857, 8616.640625, 759.0, 83.0, -0.15138937532902, 0.15591239929199, -0.16043294966221, 0.16494508087635, -0.16944274306297, 0.17391984164715, -0.17837019264698, 0.18278759717941, -0.18716582655907, 0.19149862229824, -0.19577972590923, 0.20000290870667, -0.20416194200516, 0.20825062692165, -0.21226286888123, 0.21619257330894, -0.22003373503685, 0.22378048300743, -0.22742702066898, 0.23096764087677, -0.23439680039883, 0.2377091050148, -0.24089929461479, 0.24396225810051, -0.24689310789108, 0.24968712031841, -0.25233975052834, 0.25484672188759, -0.25720390677452, 0.25940746068954, -0.26145377755165, 0.26333943009377, -0.26506134867668, 0.26661664247513, -0.26800274848938, 0.26921734213829, -0.27025836706161, 0.27112409472466, -0.27181309461594, 0.27232414484024, -0.27265644073486, 0.27280935645103, -0.27278265357018, 0.27257633209229, -0.27219074964523, 0.27162653207779, -0.27088457345963, 0.26996612548828, -0.26887273788452, 0.26760613918304, -0.26616847515106, 0.26456207036972, -0.26278960704803, 0.2608540058136, -0.25875842571259, 0.25650629401207, -0.25410127639771, 0.25154730677605, -0.24884852766991, 0.24600930511951, -0.2430341988802, 0.23992799222469, -0.23669564723969, 0.23334227502346, -0.22987321019173, 0.22629387676716, -0.22260989248753, 0.21882697939873, -0.21495096385479, 0.21098777651787, -0.20694346725941, 0.20282413065434, -0.19863593578339, 0.19438508152962, -0.19007785618305, 0.18572048842907, -0.18131928145885, 0.17688052356243, -0.17241044342518, 0.16791528463364, -0.16340121626854, 0.1588743776083, -0.15434081852436, 8869.126953125, 782.0, 85.0, 0.15408113598824, -0.15850713849068, 0.16292716562748, -0.1673356294632, 0.17172680795193, -0.17609496414661, 0.18043433129787, -0.18473905324936, 0.1890033185482, -0.19322128593922, 0.19738711416721, -0.20149499177933, 0.20553910732269, -0.20951372385025, 0.21341313421726, -0.21723172068596, 0.22096391022205, -0.22460424900055, 0.22814737260342, -0.23158799111843, 0.23492100834846, -0.23814138770103, 0.24124430119991, -0.24422504007816, 0.24707904458046, -0.24980197846889, 0.25238963961601, -0.2548380792141, 0.25714349746704, -0.25930228829384, 0.2613111436367, -0.26316693425179, 0.26486673951149, -0.26640790700912, 0.2677880525589, -0.26900497078896, 0.27005681395531, -0.27094188332558, 0.27165880799294, -0.27220648527145, 0.27258408069611, -0.27279096841812, 0.2728268802166, -0.27269175648689, 0.27238583564758, -0.27190965414047, 0.27126395702362, -0.27044978737831, 0.26946851611137, -0.26832163333893, 0.26701104640961, -0.26553881168365, 0.26390728354454, -0.26211902499199, 0.26017686724663, -0.25808390974998, 0.2558434009552, -0.25345885753632, 0.25093397498131, -0.24827271699905, 0.24547915160656, -0.24255760014057, 0.23951253294945, -0.23634858429432, 0.23307055234909, -0.22968338429928, 0.22619214653969, -0.22260205447674, 0.21891841292381, -0.21514663100243, 0.21129222214222, -0.20736074447632, 0.20335787534714, -0.19928930699825, 0.19516079127789, -0.19097808003426, 0.18674699962139, -0.182473346591, 0.17816290259361, -0.17382146418095, 0.16945478320122, -0.16506856679916, 0.16066850721836, -0.15626019239426, 0.15184916555882, 9129.0126953125, 805.0, 87.0, -0.15396678447723, 0.15829034149647, -0.16260802745819, 0.16691464185715, -0.17120485007763, 0.17547334730625, -0.17971475422382, 0.18392364680767, -0.18809461593628, 0.19222223758698, -0.19630110263824, 0.20032578706741, -0.20429094135761, 0.20819118618965, -0.21202126145363, 0.21577589213848, -0.2194499373436, 0.22303830087185, -0.22653596103191, 0.22993801534176, -0.23323968052864, 0.23643626272678, -0.23952320218086, 0.24249610304832, -0.24535067379475, 0.2480828166008, -0.25068855285645, 0.2531641125679, -0.25550591945648, 0.25771051645279, -0.25977471470833, 0.26169544458389, -0.2634699344635, 0.26509556174278, -0.26656994223595, 0.26789093017578, -0.26905655860901, 0.27006509900093, -0.2709151506424, 0.27160543203354, -0.27213495969772, 0.27250298857689, -0.27270898222923, 0.27275270223618, -0.27263414859772, 0.27235350012779, -0.27191123366356, 0.27130809426308, -0.27054503560066, 0.26962321996689, -0.26854410767555, 0.26730933785439, -0.2659207880497, 0.26438063383102, -0.26269119977951, 0.26085498929024, -0.25887483358383, 0.25675368309021, -0.25449469685555, 0.25210124254227, -0.2495768815279, 0.24692532420158, -0.24415044486523, 0.24125634133816, -0.23824717104435, 0.23512732982635, -0.23190125823021, 0.22857360541821, -0.22514906525612, 0.2216324955225, -0.21802881360054, 0.2143430262804, -0.21058024466038, 0.20674562454224, -0.20284436643124, 0.19888174533844, -0.19486305117607, 0.19079360365868, -0.18667875230312, 0.18252381682396, -0.17833414673805, 0.17411506175995, -0.16987183690071, 0.16560976207256, -0.1613340228796, 0.15704980492592, -0.15276217460632, 9396.5126953125, 828.0, 90.0, 0.15112139284611, -0.15533851087093, 0.15955303609371, -0.16376014053822, 0.16795493662357, -0.17213255167007, 0.17628800868988, -0.18041633069515, 0.18451254069805, -0.18857160210609, 0.19258852303028, -0.19655828177929, 0.20047591626644, -0.20433643460274, 0.20813491940498, -0.21186648309231, 0.21552629768848, -0.21910959482193, 0.22261168062687, -0.22602792084217, 0.22935381531715, -0.23258489370346, 0.23571684956551, -0.23874546587467, 0.24166665971279, -0.24447646737099, 0.24717107415199, -0.24974678456783, 0.25220009684563, -0.25452762842178, 0.25672620534897, -0.25879275798798, 0.2607244849205, -0.26251870393753, 0.26417291164398, -0.26568487286568, 0.26705247163773, -0.26827383041382, 0.26934725046158, -0.27027130126953, 0.27104473114014, -0.27166643738747, 0.27213564515114, -0.27245172858238, 0.27261430025101, -0.27262318134308, 0.27247843146324, -0.2721803188324, 0.2717293202877, -0.27112612128258, 0.27037164568901, -0.26946705579758, 0.26841366291046, -0.26721301674843, 0.26586690545082, -0.26437726616859, 0.26274624466896, -0.26097622513771, 0.25906971096992, -0.25702941417694, 0.25485828518867, -0.25255933403969, 0.25013586878777, -0.24759119749069, 0.24492892622948, -0.24215273559093, 0.23926644027233, -0.23627401888371, 0.23317953944206, -0.22998721897602, 0.22670134902, -0.22332634031773, 0.21986667811871, -0.21632693707943, 0.21271176636219, -0.20902587473392, 0.20527403056622, -0.20146103203297, 0.19759172201157, -0.19367100298405, 0.18970374763012, -0.18569485843182, 0.18164923787117, -0.17757180333138, 0.17346741259098, -0.16934092342854, 0.16519716382027, -0.16104093194008, 0.15687692165375, -0.15270984172821, 9671.8515625, 852.0, 94.0, 0.1519937813282, -0.15601666271687, 0.16003674268723, -0.16404983401299, 0.16805167496204, -0.17203801870346, 0.17600452899933, -0.1799468845129, 0.18386073410511, -0.1877416819334, 0.19158537685871, -0.19538743793964, 0.19914349913597, -0.20284919440746, 0.2065002322197, -0.21009229123592, 0.21362112462521, -0.21708251535892, 0.22047232091427, -0.22378642857075, 0.22702081501484, -0.23017151653767, 0.23323465883732, -0.23620647192001, 0.23908324539661, -0.24186138808727, 0.24453742802143, -0.24710799753666, 0.24956983327866, -0.25191983580589, 0.25415498018265, -0.25627246499062, 0.25826951861382, -0.26014360785484, 0.26189231872559, -0.26351338624954, 0.26500472426414, -0.26636439561844, 0.2675906419754, -0.26868185400963, 0.26963660120964, -0.27045366168022, 0.27113196253777, -0.27167063951492, 0.27206894755363, -0.27232640981674, 0.27244266867638, -0.2724175453186, 0.27225112915039, -0.27194362878799, 0.27149543166161, -0.27090713381767, 0.27017948031425, -0.26931348443031, 0.26831024885178, -0.26717105507851, 0.26589742302895, -0.26449102163315, 0.26295363903046, -0.26128733158112, 0.25949418544769, -0.25757655501366, 0.25553688406944, -0.25337782502174, 0.25110211968422, -0.24871268868446, 0.2462125569582, -0.24360489845276, 0.24089299142361, -0.23808024823666, 0.23517020046711, -0.23216645419598, 0.22907274961472, -0.22589290142059, 0.22263079881668, -0.21929043531418, 0.21587584912777, -0.2123911678791, 0.20884054899216, -0.20522822439671, 0.20155845582485, -0.19783553481102, 0.19406381249428, -0.19024761021137, 0.18639130890369, -0.18249927461147, 0.17857585847378, -0.174625441432, 0.17065235972404, -0.16666093468666, 0.16265544295311, -0.15864016115665, 0.15461927652359, -0.15059697628021, 9955.2587890625, 877.0, 96.0, -0.15193083882332, 0.15584447979927, -0.15975560247898, 0.1636603474617, -0.16755482554436, 0.17143508791924, -0.17529717087746, 0.17913711071014, -0.18295086920261, 0.18673445284367, -0.19048382341862, 0.19419494271278, -0.19786381721497, 0.20148640871048, -0.20505873858929, 0.20857685804367, -0.21203683316708, 0.21543474495411, -0.2187667787075, 0.22202910482883, -0.2252179980278, 0.22832979261875, -0.23136085271835, 0.23430767655373, -0.23716679215431, 0.23993483185768, -0.24260854721069, 0.24518473446369, -0.24766035377979, 0.25003242492676, -0.25229811668396, 0.25445467233658, -0.25649952888489, 0.25843018293381, -0.26024428009987, 0.26193964481354, -0.26351419091225, 0.26496601104736, -0.26629328727722, 0.26749441027641, -0.26856791973114, 0.26951250433922, -0.27032697200775, 0.27101030945778, -0.27156174182892, 0.27198049426079, -0.27226614952087, 0.27241829037666, -0.27243676781654, 0.27232152223587, -0.2720727622509, 0.27169072628021, -0.27117598056793, 0.27052906155586, -0.26975086331367, 0.26884230971336, -0.26780453324318, 0.26663881540298, -0.26534658670425, 0.2639294564724, -0.26238918304443, 0.26072758436203, -0.25894677639008, 0.25704890489578, -0.25503623485565, 0.25291126966476, -0.25067657232285, 0.24833481013775, -0.2458888143301, 0.24334152042866, -0.2406959682703, 0.23795528709888, -0.23512272536755, 0.23220163583755, -0.22919543087482, 0.22610761225224, -0.22294177114964, 0.21970157325268, -0.21639071404934, 0.21301297843456, -0.20957219600677, 0.20607225596905, -0.20251704752445, 0.19891053438187, -0.19525668025017, 0.19155949354172, -0.18782295286655, 0.18405111134052, -0.18024796247482, 0.17641752958298, -0.17256380617619, 0.16869077086449, -0.16480238735676, 0.16090258955956, -0.15699528157711, 0.15308429300785, 10246.969726562, 903.0, 99.0, -0.15302388370037, 0.15682722628117, -0.16062727570534, 0.1644204556942, -0.16820318996906, 0.17197187244892, -0.17572283744812, 0.17945244908333, -0.18315701186657, 0.18683284521103, -0.19047623872757, 0.19408349692822, -0.19765095412731, 0.20117489993572, -0.20465168356895, 0.20807768404484, -0.21144926548004, 0.21476285159588, -0.21801489591599, 0.2212019264698, -0.22432048618793, 0.22736717760563, -0.23033867776394, 0.2332317084074, -0.23604309558868, 0.23876971006393, -0.24140851199627, 0.24395655095577, -0.24641096591949, 0.24876900017262, -0.25102797150612, 0.25318533182144, -0.25523862242699, 0.25718548893929, -0.25902369618416, 0.26075115799904, -0.26236587762833, 0.26386600732803, -0.26524978876114, 0.26651564240456, -0.26766210794449, 0.26868781447411, -0.26959162950516, 0.27037248015404, -0.27102941274643, 0.27156174182892, -0.27196881175041, 0.27225014567375, -0.27240541577339, 0.2724344432354, -0.27233722805977, 0.2721138894558, -0.27176463603973, 0.27128994464874, -0.2706903219223, 0.26996651291847, -0.26911935210228, 0.26814982295036, -0.26705905795097, 0.26584833860397, -0.26451909542084, 0.26307284832001, -0.26151126623154, 0.25983616709709, -0.25804948806763, 0.25615328550339, -0.25414973497391, 0.25204110145569, -0.24982985854149, 0.24751847982407, -0.24510957300663, 0.242605894804, -0.24001023173332, 0.23732551932335, -0.23455473780632, 0.23170095682144, -0.22876736521721, 0.22575718164444, -0.2226736843586, 0.21952024102211, -0.21630027890205, 0.21301725506783, -0.20967468619347, 0.20627611875534, -0.20282515883446, 0.19932541251183, -0.19578053057194, 0.19219417870045, -0.18857002258301, 0.1849117577076, -0.18122304975986, 0.17750760912895, -0.17376908659935, 0.17001114785671, -0.16623744368553, 0.16245158016682, -0.15865716338158, 0.15485771000385, -0.15105676651001, 10547.229492188, 929.0, 102.0, -0.15142092108727, 0.15511421859264, -0.15880587697029, 0.16249266266823, -0.16617132723331, 0.16983856260777, -0.1734910607338, 0.17712545394897, -0.1807384043932, 0.18432654440403, -0.18788646161556, 0.19141480326653, -0.194908156991, 0.19836318492889, -0.20177648961544, 0.20514473319054, -0.20846459269524, 0.21173276007175, -0.21494595706463, 0.21810095012188, -0.22119455039501, 0.22422359883785, -0.22718496620655, 0.23007564246655, -0.23289260268211, 0.23563292622566, -0.23829375207424, 0.24087229371071, -0.2433658093214, 0.24577169120312, -0.24808736145496, 0.25031036138535, -0.25243833661079, 0.25446897745132, -0.2564001083374, 0.25822964310646, -0.25995561480522, 0.26157614588737, -0.26308950781822, 0.26449400186539, -0.26578813791275, 0.26697048544884, -0.26803973317146, 0.2689947783947, -0.26983451843262, 0.27055802941322, -0.27116456627846, 0.27165344357491, -0.27202409505844, 0.2722761631012, -0.27240934967995, 0.27242350578308, -0.2723186314106, 0.27209481596947, -0.27175235748291, 0.27129164338112, -0.27071312069893, 0.27001747488976, -0.26920548081398, 0.26827800273895, -0.26723608374596, 0.26608088612556, -0.26481363177299, 0.26343578100204, -0.26194876432419, 0.26035425066948, -0.25865396857262, 0.25684973597527, -0.25494354963303, 0.25293746590614, -0.25083363056183, 0.24863427877426, -0.24634180963039, 0.2439586520195, -0.24148733913898, 0.23893049359322, -0.23629081249237, 0.23357105255127, -0.23077407479286, 0.22790279984474, -0.22496017813683, 0.22194926440716, -0.21887314319611, 0.21573492884636, -0.21253784000874, 0.20928508043289, -0.20597989857197, 0.20262560248375, -0.19922550022602, 0.19578292965889, -0.19230124354362, 0.18878379464149, -0.18523396551609, 0.181655138731, -0.1780506670475, 0.17442393302917, -0.17077827453613, 0.16711704432964, -0.16344355046749, 0.1597610861063, -0.15607289969921, 0.15238223969936, 10856.286132812, 956.0, 105.0, 0.15088801085949, -0.15447074174881, 0.15805245935917, -0.16163022816181, 0.1652010679245, -0.16876196861267, 0.17230992019176, -0.17584186792374, 0.17935474216938, -0.18284547328949, 0.1863109767437, -0.18974816799164, 0.19315396249294, -0.19652526080608, 0.19985897839069, -0.20315207540989, 0.20640148222446, -0.2096041738987, 0.21275714039803, -0.21585740149021, 0.2189020216465, -0.22188809514046, 0.22481273114681, -0.2276731133461, 0.2304664850235, -0.23319008946419, 0.23584128916264, -0.23841744661331, 0.24091602861881, -0.24333457648754, 0.24567064642906, -0.24792192876339, 0.25008615851402, -0.25216114521027, 0.25414481759071, -0.25603517889977, 0.25783029198647, -0.25952830910683, 0.2611275613308, -0.26262634992599, 0.26402318477631, -0.26531660556793, 0.26650533080101, -0.267588108778, 0.26856380701065, -0.26943144202232, 0.27019011974335, -0.27083903551102, 0.27137756347656, -0.27180513739586, 0.27212128043175, -0.272325694561, 0.27241817116737, -0.27239862084389, 0.27226704359055, -0.27202361822128, 0.27166855335236, -0.27120226621628, 0.27062523365021, -0.26993802189827, 0.26914137601852, -0.268236130476, 0.26722320914268, -0.26610368490219, 0.26487866044044, -0.26354944705963, 0.26211741566658, -0.26058399677277, 0.2589507997036, -0.25721946358681, 0.25539177656174, -0.2534696161747, 0.25145488977432, -0.24934968352318, 0.24715608358383, -0.2448763102293, 0.24251264333725, -0.24006743729115, 0.23754313588142, -0.23494224250317, 0.23226730525494, -0.22952097654343, 0.22670592367649, -0.22382488846779, 0.22088065743446, -0.2178760766983, 0.21481402218342, -0.2116974145174, 0.20852918922901, -0.20531234145164, 0.20204988121986, -0.19874483346939, 0.19540025293827, -0.19201919436455, 0.18860472738743, -0.18515995144844, 0.18168792128563, -0.17819173634052, 0.17467445135117, -0.17113915085793, 0.16758885979652, -0.16402661800385, 0.16045545041561, -0.15687830746174, 0.1532981544733, 11174.400390625, 984.0, 109.0, 0.15128552913666, -0.15475794672966, 0.15822921693325, -0.16169661283493, 0.16515745222569, -0.16860900819302, 0.17204849421978, -0.17547316849232, 0.17888022959232, -0.18226687610149, 0.18563029170036, -0.18896768987179, 0.1922762542963, -0.19555315375328, 0.19879558682442, -0.20200076699257, 0.20516590774059, -0.20828825235367, 0.21136502921581, -0.21439354121685, 0.21737107634544, -0.2202949821949, 0.22316260635853, -0.22597137093544, 0.22871872782707, -0.23140214383602, 0.23401917517185, -0.23656739294529, 0.23904444277287, -0.24144804477692, 0.24377591907978, -0.24602591991425, 0.24819591641426, -0.25028386712074, 0.25228780508041, -0.25420582294464, 0.25603610277176, -0.25777688622475, 0.25942653417587, -0.26098346710205, 0.26244616508484, -0.26381322741508, 0.26508337259293, -0.26625534892082, 0.26732802391052, -0.26830038428307, 0.26917144656181, -0.26994040608406, 0.27060651779175, -0.27116909623146, 0.27162766456604, -0.27198171615601, 0.27223092317581, -0.2723750770092, 0.27241399884224, -0.27234768867493, 0.27217620611191, -0.27189970016479, 0.27151846885681, -0.27103286981583, 0.270443379879, -0.2697506248951, 0.26895520091057, -0.26805794239044, 0.26705971360207, -0.26596146821976, 0.26476427912712, -0.26346930861473, 0.26207783818245, -0.26059114933014, 0.25901073217392, -0.25733807682991, 0.25557479262352, -0.25372257828712, 0.25178316235542, -0.24975843727589, 0.24765031039715, -0.24546074867249, 0.24319183826447, -0.24084571003914, 0.2384245544672, -0.23593062162399, 0.23336623609066, -0.23073376715183, 0.22803564369678, -0.22527430951595, 0.22245232760906, -0.21957221627235, 0.21663661301136, -0.21364812552929, 0.21060943603516, -0.20752322673798, 0.20439223945141, -0.20121921598911, 0.19800692796707, -0.19475813210011, 0.19147562980652, -0.18816222250462, 0.18482069671154, -0.18145388364792, 0.17806458473206, -0.17465557157993, 0.17122964560986, -0.16778957843781, 0.1643381267786, -0.16087803244591, 0.15741202235222, -0.15394277870655, 0.15047296881676, 11501.834960938, 1014.0, 110.0, 0.15303859114647, -0.15648706257343, 0.15993294119835, -0.16337360441685, 0.16680637001991, -0.17022858560085, 0.17363752424717, -0.17703047394753, 0.18040472269058, -0.18375752866268, 0.18708615005016, -0.19038785994053, 0.19365990161896, -0.19689954817295, 0.20010407269001, -0.20327077805996, 0.2063969373703, -0.2094799131155, 0.21251700818539, -0.21550561487675, 0.21844312548637, -0.22132696211338, 0.22415460646152, -0.22692355513573, 0.22963134944439, -0.2322755753994, 0.23485387861729, -0.23736393451691, 0.23980350792408, -0.24217039346695, 0.24446243047714, -0.24667756259441, 0.248813778162, -0.25086909532547, 0.25284168124199, -0.25472971796989, 0.25653147697449, -0.25824531912804, 0.25986966490746, -0.2614029943943, 0.26284393668175, -0.26419118046761, 0.26544347405434, -0.26659965515137, 0.26765871047974, -0.26861962676048, 0.26948156952858, -0.27024373412132, 0.2709054350853, -0.27146610617638, 0.2719252705574, -0.27228248119354, 0.27253746986389, -0.27269002795219, 0.27274006605148, -0.27268758416176, 0.27253264188766, -0.27227544784546, 0.27191630005836, -0.27145555615425, 0.2708937227726, -0.27023133635521, 0.26946914196014, -0.26860782504082, 0.2676482796669, -0.26659142971039, 0.26543834805489, -0.26419013738632, 0.26284801959991, -0.26141330599785, 0.25988733768463, -0.2582716345787, 0.25656768679619, -0.25477716326714, 0.25290170311928, -0.25094312429428, 0.24890325963497, -0.24678400158882, 0.24458733201027, -0.24231527745724, 0.23996995389462, -0.23755352199078, 0.23506815731525, -0.23251615464687, 0.22989980876446, -0.22722147405148, 0.22448354959488, -0.2216884791851, 0.21883873641491, -0.21593683958054, 0.21298530697823, -0.20998673141003, 0.20694367587566, -0.20385876297951, 0.20073461532593, -0.19757388532162, 0.19437921047211, -0.19115325808525, 0.1878986954689, -0.18461818993092, 0.18131439387798, -0.1779899597168, 0.17464755475521, -0.17128981649876, 0.16791935265064, -0.16453878581524, 0.16115069389343, -0.15775762498379, 0.15436214208603, -0.15096673369408, 11838.864257812, 1043.0, 114.0, -0.15112055838108, 0.15445876121521, -0.15779638290405, 0.16113103926182, -0.16446034610271, 0.16778185963631, -0.17109313607216, 0.17439170181751, -0.17767512798309, 0.1809408813715, -0.18418650329113, 0.18740947544575, -0.19060732424259, 0.19377754628658, -0.19691763818264, 0.20002511143684, -0.2030975073576, 0.20613235235214, -0.2091272175312, 0.21207962930202, -0.21498723328114, 0.21784760057926, -0.22065840661526, 0.22341729700565, -0.22612200677395, 0.22877025604248, -0.23135982453823, 0.23388853669167, -0.23635426163673, 0.23875489830971, -0.2410884052515, 0.24335280060768, -0.24554613232613, 0.24766653776169, -0.24971216917038, 0.2516812980175, -0.25357216596603, 0.25538319349289, -0.25711280107498, 0.25875946879387, -0.26032176613808, 0.2617983520031, -0.26318794488907, 0.26448932290077, -0.26570135354996, 0.26682299375534, -0.26785326004028, 0.26879125833511, -0.26963618397713, 0.27038729190826, -0.27104398608208, 0.27160567045212, -0.27207183837891, 0.2724421620369, -0.27271634340286, 0.27289408445358, -0.27297535538673, 0.27296003699303, -0.27284821867943, 0.27263998985291, -0.27233561873436, 0.27193540334702, -0.27143970131874, 0.27084898948669, -0.27016386389732, 0.2693849503994, -0.26851296424866, 0.2675487101078, -0.26649311184883, 0.26534709334373, -0.26411175727844, 0.26278817653656, -0.26137760281563, 0.25988125801086, -0.2583005130291, 0.25663679838181, -0.2548916041851, 0.25306648015976, -0.25116300582886, 0.24918292462826, -0.2471279501915, 0.24499988555908, -0.24280059337616, 0.24053198099136, -0.23819601535797, 0.23579472303391, -0.23333016037941, 0.23080442845821, -0.22821965813637, 0.22557806968689, -0.22288185358047, 0.22013328969479, -0.21733465790749, 0.21448826789856, -0.21159645915031, 0.20866160094738, -0.20568607747555, 0.20267227292061, -0.199622631073, 0.19653955101967, -0.19342549145222, 0.19028286635876, -0.18711413443089, 0.18392173945904, -0.18070811033249, 0.17747569084167, -0.17422690987587, 0.17096418142319, -0.16768990457058, 0.16440646350384, -0.16111624240875, 0.15782158076763, -0.15452480316162, 0.15122818946838, 12185.76953125, 1074.0, 117.0, 0.15314620733261, -0.15636789798737, 0.15958824753761, -0.16280511021614, 0.16601628065109, -0.16921958327293, 0.17241281270981, -0.17559371888638, 0.17876009643078, -0.18190966546535, 0.18504020571709, -0.18814943730831, 0.19123511016369, -0.19429495930672, 0.19732671976089, -0.20032815635204, 0.20329701900482, -0.20623107254505, 0.20912809669971, -0.21198588609695, 0.21480223536491, -0.21757499873638, 0.22030203044415, -0.22298119962215, 0.22561040520668, -0.22818757593632, 0.23071071505547, -0.23317778110504, 0.23558685183525, -0.23793597519398, 0.24022327363491, -0.24244691431522, 0.24460510909557, -0.24669608473778, 0.24871818721294, -0.2506697177887, 0.25254914164543, -0.25435489416122, 0.25608548521996, -0.25773948431015, 0.2593155503273, -0.26081240177155, 0.26222878694534, -0.2635635137558, 0.26481550931931, -0.26598370075226, 0.26706716418266, -0.2680649459362, 0.2689762711525, -0.26980036497116, 0.27053654193878, -0.27118420600891, 0.27174279093742, -0.27221187949181, 0.27259105443954, -0.27288001775742, 0.27307853102684, -0.27318647503853, 0.27320373058319, -0.27313029766083, 0.27296626567841, -0.27271178364754, 0.27236706018448, -0.2719324529171, 0.27140828967094, -0.27079504728317, 0.27009326219559, -0.26930350065231, 0.26842650771141, -0.26746296882629, 0.26641371846199, -0.26527971029282, 0.26406180858612, -0.26276111602783, 0.26137873530388, -0.25991576910019, 0.25837349891663, -0.25675317645073, 0.25505620241165, -0.25328394770622, 0.25143790245056, -0.24951957166195, 0.24753056466579, -0.24547250568867, 0.24334706366062, -0.24115601181984, 0.23890109360218, -0.23658414185047, 0.23420703411102, -0.23177167773247, 0.22928000986576, -0.2267340272665, 0.22413574159145, -0.22148717939854, 0.21879045665264, -0.21604764461517, 0.21326088905334, -0.21043233573437, 0.20756414532661, -0.20465852320194, 0.20171764492989, -0.19874374568462, 0.19573903083801, -0.19270575046539, 0.18964612483978, -0.18656238913536, 0.18345680832863, -0.18033158779144, 0.17718896269798, -0.17403116822243, 0.17086040973663, -0.16767890751362, 0.16448882222176, -0.1612923592329, 0.15809163451195, -0.15488880872726, 0.15168599784374, 12542.83984375, 1106.0, 119.0, 0.15293842554092, -0.15607599914074, 0.15921191871166, -0.16234418749809, 0.16547080874443, -0.16858977079391, 0.17169904708862, -0.17479656636715, 0.17788028717041, -0.18094815313816, 0.183998093009, -0.18702802062035, 0.19003586471081, -0.19301955401897, 0.19597700238228, -0.19890613853931, 0.20180490612984, -0.20467123389244, 0.20750308036804, -0.21029840409756, 0.21305520832539, -0.21577145159245, 0.21844518184662, -0.22107443213463, 0.2236572355032, -0.22619168460369, 0.22867591679096, -0.23110803961754, 0.23348623514175, -0.2358087003231, 0.23807369172573, -0.24027946591377, 0.24242435395718, -0.24450670182705, 0.24652490019798, -0.24847739934921, 0.25036266446114, -0.25217926502228, 0.25392580032349, -0.25560083985329, 0.25720310211182, -0.25873133540154, 0.26018434762955, -0.26156094670296, 0.26286008954048, -0.26408073306084, 0.26522186398506, -0.26628261804581, 0.26726216077805, -0.26815965771675, 0.26897442340851, -0.2697057723999, 0.27035313844681, -0.27091598510742, 0.27139389514923, -0.2717864215374, 0.2720932662487, -0.27231419086456, 0.2724489569664, -0.27249753475189, 0.27245980501175, -0.27233579754829, 0.27212566137314, -0.27182948589325, 0.27144750952721, -0.27098006010056, 0.27042749524117, -0.26979023218155, 0.26906877756119, -0.26826369762421, 0.26737561821938, -0.26640525460243, 0.26535335183144, -0.26422074437141, 0.26300829648972, -0.2617170214653, 0.26034784317017, -0.25890192389488, 0.25738030672073, -0.25578424334526, 0.25411495566368, -0.25237375497818, 0.25056195259094, -0.2486809939146, 0.24673229455948, -0.24471738934517, 0.24263781309128, -0.24049514532089, 0.23829105496407, -0.23602718114853, 0.2337052822113, -0.23132708668709, 0.22889439761639, -0.22640904784203, 0.22387287020683, -0.22128780186176, 0.21865572035313, -0.21597857773304, 0.21325834095478, -0.21049702167511, 0.20769660174847, -0.2048591375351, 0.20198664069176, -0.19908118247986, 0.19614484906197, -0.19317968189716, 0.19018779695034, -0.1871712654829, 0.18413220345974, -0.1810726672411, 0.17799478769302, -0.17490062117577, 0.17179226875305, -0.16867180168629, 0.16554129123688, -0.16240277886391, 0.15925830602646, -0.15610991418362, 0.15295958518982, 12910.373046875, 1138.0, 124.0, 0.15301696956158, -0.15604294836521, 0.15906731784344, -0.16208828985691, 0.16510406136513, -0.16811284422874, 0.17111280560493, -0.17410209774971, 0.17707890272141, -0.18004137277603, 0.18298763036728, -0.18591582775116, 0.18882410228252, -0.19171059131622, 0.19457343220711, -0.19741077721119, 0.20022074878216, -0.20300152897835, 0.20575125515461, -0.20846809446812, 0.21115024387836, -0.21379588544369, 0.2164032459259, -0.21897053718567, 0.22149600088596, -0.22397792339325, 0.22641456127167, -0.22880426049232, 0.23114533722401, -0.23343616724014, 0.23567512631416, -0.2378606647253, 0.23999120295048, -0.24206526577473, 0.24408134818077, -0.24603801965714, 0.24793387949467, -0.2497675716877, 0.25153777003288, -0.2532431781292, 0.25488260388374, -0.25645479559898, 0.25795865058899, -0.25939306616783, 0.26075699925423, -0.26204940676689, 0.26326939463615, -0.2644160091877, 0.26548844575882, -0.26648589968681, 0.26740762591362, -0.26825293898582, 0.26902121305466, -0.26971188187599, 0.27032443881035, -0.27085837721825, 0.27131333947182, -0.27168896794319, 0.27198499441147, -0.27220118045807, 0.27233734726906, -0.27239340543747, 0.27236929535866, -0.27226504683495, 0.27208071947098, -0.27181643247604, 0.2714723944664, -0.27104884386063, 0.27054607868195, -0.26996451616287, 0.26930451393127, -0.26856657862663, 0.26775127649307, -0.26685917377472, 0.26589092612267, -0.26484721899033, 0.26372888684273, -0.26253667473793, 0.26127147674561, -0.25993418693542, 0.25852584838867, -0.25704738497734, 0.255499958992, -0.25388464331627, 0.25220260024071, -0.25045508146286, 0.24864329397678, -0.24676856398582, 0.24483221769333, -0.24283565580845, 0.2407802939415, -0.23866757750511, 0.23649902641773, -0.23427614569664, 0.23200049996376, -0.22967371344566, 0.22729736566544, -0.22487314045429, 0.22240270674229, -0.21988777816296, 0.21733006834984, -0.21473133563995, 0.21209333837032, -0.20941787958145, 0.20670676231384, -0.203961789608, 0.20118479430676, -0.19837763905525, 0.19554215669632, -0.19268020987511, 0.18979367613792, -0.18688440322876, 0.18395428359509, -0.18100517988205, 0.17803896963596, -0.17505751550198, 0.17206266522408, -0.16905629634857, 0.16604025661945, -0.16301637887955, 0.15998648107052, -0.15695239603519, 0.15391591191292, -0.15087881684303, 13288.67578125, 1170.0, 129.0, 0.15071077644825, -0.15362957119942, 0.15654803812504, -0.15946458280087, 0.16237761080265, -0.16528551280499, 0.1681866645813, -0.17107942700386, 0.17396216094494, -0.17683321237564, 0.17969092726707, -0.18253363668919, 0.18535967171192, -0.18816737830639, 0.19095507264137, -0.19372110068798, 0.196463778615, -0.19918146729469, 0.20187249779701, -0.20453523099422, 0.20716799795628, -0.20976920425892, 0.21233721077442, -0.21487040817738, 0.21736720204353, -0.21982601284981, 0.22224529087543, -0.22462350130081, 0.22695909440517, -0.2292505800724, 0.23149648308754, -0.23369534313679, 0.23584574460983, -0.23794627189636, 0.23999553918839, -0.24199222028255, 0.24393500387669, -0.24582257866859, 0.24765372276306, -0.24942719936371, 0.25114184617996, -0.25279650092125, 0.25439006090164, -0.25592148303986, 0.25738969445229, -0.25879374146461, 0.2601326406002, -0.26140552759171, 0.26261153817177, -0.26374980807304, 0.26481962203979, -0.26582020521164, 0.26675090193748, -0.26761108636856, 0.26840016245842, -0.26911759376526, 0.2697628736496, -0.27033558487892, 0.27083531022072, -0.27126172184944, 0.27161455154419, -0.27189350128174, 0.2720984518528, -0.27222922444344, 0.27228572964668, -0.27226790785789, 0.27217584848404, -0.27200952172279, 0.27176913619041, -0.27145478129387, 0.27106669545174, -0.27060517668724, 0.27007052302361, -0.2694630920887, 0.26878333091736, -0.26803168654442, 0.26720866560936, -0.26631483435631, 0.26535081863403, -0.26431727409363, 0.26321491599083, -0.26204445958138, 0.26080673933029, -0.25950258970261, 0.25813284516335, -0.25669848918915, 0.25520047545433, -0.25363981723785, 0.25201752781868, -0.25033473968506, 0.24859255552292, -0.24679213762283, 0.2449346780777, -0.24302142858505, 0.24105364084244, -0.23903261125088, 0.23695968091488, -0.23483619093895, 0.23266352713108, -0.23044312000275, 0.22817641496658, -0.22586484253407, 0.22350990772247, -0.22111313045025, 0.21867603063583, -0.21620015799999, 0.21368706226349, -0.21113835275173, 0.20855559408665, -0.20594042539597, 0.2032944560051, -0.20061932504177, 0.19791665673256, -0.19518810510635, 0.19243533909321, -0.18965999782085, 0.18686373531818, -0.18404825031757, 0.18121518194675, -0.17836618423462, 0.17550294101238, -0.17262707650661, 0.16974025964737, -0.16684414446354, 0.16394034028053, -0.16103047132492, 0.15811617672443, -0.15519903600216, 0.15228064358234, 13678.063476562, 1205.0, 131.0, -0.1509692966938, 0.15387181937695, -0.15677399933338, 0.15967430174351, -0.16257113218307, 0.165462911129, -0.16834804415703, 0.17122492194176, -0.17409193515778, 0.17694744467735, -0.17978985607624, 0.18261751532555, -0.18542878329754, 0.18822205066681, -0.19099566340446, 0.19374798238277, -0.19647741317749, 0.19918228685856, -0.20186102390289, 0.20451198518276, -0.20713356137276, 0.20972418785095, -0.2122822701931, 0.21480624377728, -0.21729452908039, 0.21974562108517, -0.222157984972, 0.22453011572361, -0.22686053812504, 0.22914777696133, -0.23139041662216, 0.23358701169491, -0.23573619127274, 0.23783659934998, -0.23988687992096, 0.24188573658466, -0.24383188784122, 0.2457240819931, -0.2475611269474, 0.24934183061123, -0.25106504559517, 0.25272965431213, -0.25433459877968, 0.25587883591652, -0.25736138224602, 0.25878125429153, -0.2601375579834, 0.26142942905426, -0.26265597343445, 0.26381647586823, -0.26491013169289, 0.26593625545502, -0.26689419150352, 0.26778334379196, -0.26860311627388, 0.2693530023098, -0.27003255486488, 0.27064126729965, -0.27117884159088, 0.2716449201107, -0.27203920483589, 0.27236145734787, -0.27261152863503, 0.27278923988342, -0.27289453148842, 0.27292737364769, -0.27288773655891, 0.27277570962906, -0.27259141206741, 0.27233496308327, -0.2720066010952, 0.27160653471947, -0.27113512158394, 0.27059268951416, -0.26997962594032, 0.26929637789726, -0.26854342222214, 0.26772132515907, -0.26683062314987, 0.26587200164795, -0.26484608650208, 0.26375359296799, -0.26259532570839, 0.26137199997902, -0.26008453965187, 0.25873374938965, -0.25732061266899, 0.25584605336189, -0.25431108474731, 0.25271672010422, -0.25106403231621, 0.24935415387154, -0.24758817255497, 0.24576731026173, -0.24389272928238, 0.24196568131447, -0.23998741805553, 0.2379592359066, -0.23588244616985, 0.2337583899498, -0.23158843815327, 0.22937397658825, -0.22711642086506, 0.22481718659401, -0.22247774899006, 0.22009955346584, -0.21768410503864, 0.21523287892342, -0.21274742484093, 0.2102292329073, -0.20767986774445, 0.20510086417198, -0.20249377191067, 0.19986017048359, -0.19720162451267, 0.19451969861984, -0.19181597232819, 0.18909202516079, -0.18634943664074, 0.18358977138996, -0.1808146238327, 0.17802554368973, -0.17522411048412, 0.17241188883781, -0.1695904135704, 0.16676124930382, -0.16392590105534, 0.16108590364456, -0.15824276208878, 0.15539798140526, -0.15255303680897, 14078.861328125, 1240.0, 136.0, 0.15121532976627, -0.15399622917175, 0.15677763521671, -0.15955819189548, 0.16233648359776, -0.16511110961437, 0.16788066923618, -0.17064373195171, 0.17339888215065, -0.17614464461803, 0.17887960374355, -0.18160228431225, 0.18431125581264, -0.18700504302979, 0.18968218564987, -0.19234122335911, 0.19498068094254, -0.19759912788868, 0.20019508898258, -0.20276708900928, 0.20531372725964, -0.20783351361752, 0.21032504737377, -0.21278688311577, 0.21521762013435, -0.21761584281921, 0.21998016536236, -0.22230918705463, 0.2246015816927, -0.22685596346855, 0.22907102108002, -0.23124544322491, 0.23337791860104, -0.23546719551086, 0.23751199245453, -0.23951111733913, 0.2414633333683, -0.2433674633503, 0.24522235989571, -0.24702689051628, 0.24877995252609, -0.25048047304153, 0.25212743878365, -0.25371977686882, 0.25525653362274, -0.25673678517342, 0.25815957784653, -0.25952404737473, 0.26082935929298, -0.26207467913628, 0.26325926184654, -0.26438230276108, 0.26544317603111, -0.26644119620323, 0.26737570762634, -0.26824614405632, 0.26905196905136, -0.26979267597198, 0.27046781778336, -0.27107691764832, 0.27161964774132, -0.27209562063217, 0.2725045979023, -0.27284628152847, 0.27312046289444, -0.27332699298859, 0.2734657227993, -0.27353659272194, 0.27353954315186, -0.27347457408905, 0.27334174513817, -0.27314114570618, 0.27287289500237, -0.27253717184067, 0.27213421463966, -0.27166429162025, 0.27112764120102, -0.27052468061447, 0.26985576748848, -0.26912131905556, 0.26832181215286, -0.2674577832222, 0.26652973890305, -0.26553830504417, 0.26448410749435, -0.26336777210236, 0.26219007372856, -0.26095169782639, 0.25965341925621, -0.25829610228539, 0.25688058137894, -0.25540772080421, 0.25387847423553, -0.25229373574257, 0.2506545484066, -0.24896188080311, 0.2472168058157, -0.24542039632797, 0.2435737401247, -0.2416779845953, 0.23973427712917, -0.2377437800169, 0.23570774495602, -0.23362734913826, 0.23150388896465, -0.22933860123158, 0.22713281214237, -0.22488780319691, 0.22260491549969, -0.22028549015522, 0.21793089807034, -0.21554251015186, 0.21312171220779, -0.21066990494728, 0.20818850398064, -0.20567892491817, 0.20314259827137, -0.20058096945286, 0.19799546897411, -0.19538754224777, 0.19275866448879, -0.19011025130749, 0.18744379281998, -0.18476071953773, 0.18206249177456, -0.17935056984425, 0.17662639915943, -0.17389141023159, 0.17114704847336, -0.16839474439621, 0.16563592851162, -0.16287200152874, 0.16010436415672, -0.15733443200588, 0.15456356108189, -0.15179313719273, 14491.404296875, 1277.0, 139.0, -0.15186196565628, 0.15455102920532, -0.15723961591721, 0.15992648899555, -0.16261042654514, 0.16529011726379, -0.16796432435513, 0.17063176631927, -0.17329113185406, 0.17594115436077, -0.17858052253723, 0.18120793998241, -0.18382209539413, 0.18642167747021, -0.18900537490845, 0.19157189130783, -0.19411990046501, 0.19664810597897, -0.19915518164635, 0.20163983106613, -0.20410077273846, 0.20653669536114, -0.20894630253315, 0.21132834255695, -0.21368150413036, 0.21600456535816, -0.21829622983932, 0.2205552905798, -0.2227805107832, 0.22497066855431, -0.22712454199791, 0.22924098372459, -0.2313187867403, 0.23335681855679, -0.23535391688347, 0.23730899393559, -0.23922093212605, 0.24108865857124, -0.24291111528873, 0.24468725919724, -0.24641609191895, 0.24809661507607, -0.24972787499428, 0.25130891799927, -0.25283885002136, 0.25431677699089, -0.2557418346405, 0.2571132183075, -0.25843009352684, 0.2596917450428, -0.26089736819267, 0.26204627752304, -0.26313781738281, 0.26417130231857, -0.2651461660862, 0.26606178283691, -0.26691764593124, 0.26771324872971, -0.2684480547905, 0.26912167668343, -0.26973369717598, 0.27028375864029, -0.27077147364616, 0.27119660377502, -0.27155882120132, 0.27185797691345, -0.27209383249283, 0.27226623892784, -0.27237510681152, 0.27242031693459, -0.27240186929703, 0.27231976389885, -0.27217400074005, 0.2719646692276, -0.27169188857079, 0.27135580778122, -0.27095660567284, 0.27049449086189, -0.26996973156929, 0.26938265562057, -0.26873353123665, 0.26802280545235, -0.26725080609322, 0.26641800999641, -0.2655248939991, 0.26457196474075, -0.26355975866318, 0.26248887181282, -0.26135990023613, 0.2601734995842, -0.25893035531044, 0.25763115286827, -0.25627663731575, 0.25486761331558, -0.25340485572815, 0.25188919901848, -0.25032150745392, 0.24870266020298, -0.24703358113766, 0.24531523883343, -0.24354857206345, 0.24173457920551, -0.23987430334091, 0.2379687577486, -0.23601903021336, 0.23402619361877, -0.23199136555195, 0.22991566359997, -0.22780026495457, 0.225646302104, -0.22345499694347, 0.22122751176357, -0.21896508336067, 0.21666894853115, -0.21434034407139, 0.21198052167892, -0.20959077775478, 0.20717236399651, -0.20472657680511, 0.20225471258163, -0.19975809752941, 0.19723802804947, -0.19469583034515, 0.19213283061981, -0.18955035507679, 0.18694972991943, -0.18433228135109, 0.18169936537743, -0.17905229330063, 0.1763924062252, -0.1737210303545, 0.17103950679302, -0.1683491319418, 0.16565124690533, -0.16294714808464, 0.16023814678192, -0.15752552449703, 0.15481059253216, -0.152094617486, 14916.034179688, 1313.0, 146.0, -0.15098628401756, 0.1535754352808, -0.15616418421268, 0.15875141322613, -0.1613360196352, 0.16391687095165, -0.16649284958839, 0.16906282305717, -0.17162562906742, 0.17418013513088, -0.17672517895699, 0.17925961315632, -0.18178229033947, 0.1842920333147, -0.18678767979145, 0.18926808238029, -0.19173207879066, 0.19417850673199, -0.19660620391369, 0.1990140080452, -0.20140078663826, 0.20376537740231, -0.20610664784908, 0.20842346549034, -0.21071469783783, 0.2129792124033, -0.21521590650082, 0.2174236625433, -0.21960140764713, 0.22174805402756, -0.22386252880096, 0.22594375908375, -0.22799071669579, 0.23000235855579, -0.23197767138481, 0.23391564190388, -0.23581530153751, 0.23767566680908, -0.23949579894543, 0.24127474427223, -0.24301160871983, 0.24470546841621, -0.24635548889637, 0.24796077609062, -0.2495205104351, 0.25103387236595, -0.2525001168251, 0.25391840934753, -0.25528806447983, 0.2566083073616, -0.25787851214409, 0.25909796357155, -0.26026606559753, 0.26138213276863, -0.26244562864304, 0.26345601677895, -0.26441267132759, 0.26531517505646, -0.26616302132607, 0.26695576310158, -0.26769295334816, 0.26837423443794, -0.26899924874306, 0.26956766843796, -0.27007913589478, 0.27053347229958, -0.27093034982681, 0.2712696492672, -0.27155110239983, 0.27177464962006, -0.27194008231163, 0.27204740047455, -0.27209651470184, 0.27208742499352, -0.27202010154724, 0.27189460396767, -0.27171102166176, 0.27146944403648, -0.27117002010345, 0.27081286907196, -0.2703982591629, 0.26992636919022, -0.2693974673748, 0.26881185173988, -0.26816982030869, 0.26747173070908, -0.26671800017357, 0.26590895652771, -0.26504510641098, 0.26412689685822, -0.26315480470657, 0.26212936639786, -0.26105111837387, 0.25992065668106, -0.25873854756355, 0.25750547647476, -0.25622203946114, 0.25488895177841, -0.25350689888, 0.25207662582397, -0.2505989074707, 0.24907445907593, -0.24750411510468, 0.24588871002197, -0.24422904849052, 0.24252602458, -0.24078050255775, 0.23899339139462, -0.23716560006142, 0.23529809713364, -0.23339180648327, 0.23144771158695, -0.22946681082249, 0.22745008766651, -0.22539858520031, 0.22331331670284, -0.22119532525539, 0.21904569864273, -0.21686546504498, 0.21465572714806, -0.2124175876379, 0.21015211939812, -0.20786044001579, 0.20554366707802, -0.20320291817188, 0.20083932578564, -0.19845402240753, 0.19604814052582, -0.19362282752991, 0.19117924571037, -0.1887185126543, 0.18624179065228, -0.18375021219254, 0.18124495446682, -0.17872716486454, 0.17619796097279, -0.17365850508213, 0.17110992968082, -0.16855338215828, 0.16598998010159, -0.16342087090015, 0.16084715723991, -0.15826995670795, 0.15569038689137, -0.15310952067375, 0.15052846074104, 15353.107421875, 1352.0, 148.0, 0.15024577081203, -0.15282043814659, 0.15539583563805, -0.15797087550163, 0.16054444015026, -0.16311545670033, 0.16568277776241, -0.1682453006506, 0.17080189287663, -0.17335142195225, 0.17589275538921, -0.17842473089695, 0.18094623088837, -0.18345607817173, 0.18595312535763, -0.18843622505665, 0.19090424478054, -0.19335599243641, 0.19579035043716, -0.19820614159107, 0.20060224831104, -0.2029775083065, 0.20533077418804, -0.20766094326973, 0.20996686816216, -0.21224743127823, 0.21450151503086, -0.21672801673412, 0.21892586350441, -0.22109393775463, 0.22323118150234, -0.2253365367651, 0.22740893065929, -0.22944734990597, 0.231450766325, -0.23341816663742, 0.2353485673666, -0.23724097013474, 0.23909443616867, -0.24090801179409, 0.24268075823784, -0.24441179633141, 0.24610023200512, -0.24774520099163, 0.24934583902359, -0.25090134143829, 0.25241088867188, -0.25387373566628, 0.25528907775879, -0.256656229496, 0.25797444581985, -0.25924307107925, 0.26046144962311, -0.26162892580032, 0.26274487376213, -0.26380878686905, 0.26482003927231, -0.26577815413475, 0.26668262481689, -0.26753297448158, 0.2683287858963, -0.26906961202621, 0.26975509524345, -0.27038487792015, 0.27095866203308, -0.2714761197567, 0.27193701267242, -0.27234110236168, 0.27268818020821, -0.27297809720039, 0.27321070432663, -0.27338588237762, 0.27350357174873, -0.27356374263763, 0.27356633543968, -0.27351140975952, 0.27339899539948, -0.27322918176651, 0.27300205826759, -0.27271777391434, 0.27237650752068, -0.27197846770287, 0.27152386307716, -0.27101296186447, 0.27044606208801, -0.26982352137566, 0.26914563775063, -0.26841279864311, 0.26762545108795, -0.26678398251534, 0.26588889956474, -0.26494070887566, 0.26393988728523, -0.2628870010376, 0.2617826461792, -0.26062738895416, 0.25942188501358, -0.25816676020622, 0.25686272978783, -0.25551047921181, 0.2541107237339, -0.25266420841217, 0.25117173790932, -0.2496340572834, 0.24805201590061, -0.24642643332481, 0.24475817382336, -0.24304810166359, 0.24129711091518, -0.23950611054897, 0.23767603933811, -0.23580783605576, 0.23390246927738, -0.23196090757847, 0.22998413443565, -0.22797317802906, 0.22592903673649, -0.22385273873806, 0.22174534201622, -0.21960788965225, 0.21744145452976, -0.2152470946312, 0.21302588284016, -0.21077893674374, 0.20850732922554, -0.2062121629715, 0.2038945555687, -0.20155562460423, 0.19919645786285, -0.19681818783283, 0.19442194700241, -0.19200883805752, 0.1895799934864, -0.18713654577732, 0.1846795976162, -0.18221028149128, 0.17972971498966, -0.17723900079727, 0.17473927140236, -0.17223161458969, 0.1697171330452, -0.1671969294548, 0.16467209160328, -0.16214370727539, 0.15961283445358, -0.15708054602146, 0.15454788506031, -0.15201590955257, 15802.98828125, 1393.0, 151.0, -0.15228824317455, 0.15475164353848, -0.15721483528614, 0.15967683494091, -0.16213670372963, 0.16459347307682, -0.16704612970352, 0.16949373483658, -0.17193526029587, 0.17436973750591, -0.17679616808891, 0.17921352386475, -0.18162082135677, 0.18401704728603, -0.18640118837357, 0.18877221643925, -0.19112913310528, 0.1934709250927, -0.19579657912254, 0.19810508191586, -0.20039540529251, 0.20266655087471, -0.20491752028465, 0.20714731514454, -0.20935492217541, 0.21153934299946, -0.21369960904121, 0.21583473682404, -0.21794374287128, 0.22002565860748, -0.22207951545715, 0.2241043895483, -0.22609932720661, 0.22806338965893, -0.22999566793442, 0.23189523816109, -0.23376122117043, 0.23559272289276, -0.23738886415958, 0.23914879560471, -0.24087166786194, 0.24255664646626, -0.24420294165611, 0.24580973386765, -0.24737623333931, 0.24890170991421, -0.2503853738308, 0.2518265247345, -0.25322446227074, 0.25457847118378, -0.2558878660202, 0.25715205073357, -0.25837033987045, 0.25954213738441, -0.260666847229, 0.26174393296242, -0.26277282834053, 0.26375302672386, -0.26468399167061, 0.26556530594826, -0.26639646291733, 0.26717704534531, -0.267906665802, 0.26858496665955, -0.26921153068542, 0.26978605985641, -0.27030828595161, 0.27077785134315, -0.2711945772171, 0.27155822515488, -0.2718685567379, 0.27212542295456, -0.27232870459557, 0.27247822284698, -0.27257391810417, 0.27261573076248, -0.27260357141495, 0.27253749966621, -0.27241748571396, 0.2722435593605, -0.27201581001282, 0.27173432707787, -0.27139925956726, 0.27101069688797, -0.27056884765625, 0.27007392048836, -0.26952612400055, 0.26892572641373, -0.26827299594879, 0.26756826043129, -0.26681184768677, 0.26600408554077, -0.26514536142349, 0.26423612236977, -0.26327675580978, 0.26226776838303, -0.26120960712433, 0.26010277867317, -0.25894781947136, 0.25774526596069, -0.25649571418762, 0.25519976019859, -0.25385802984238, 0.25247114896774, -0.25103977322578, 0.24956460297108, -0.2480463385582, 0.24648571014404, -0.24488343298435, 0.24324029684067, -0.24155707657337, 0.23983456194401, -0.23807357251644, 0.2362749427557, -0.23443950712681, 0.23256814479828, -0.23066173493862, 0.22872117161751, -0.22674733400345, 0.22474117577076, -0.22270362079144, 0.22063560783863, -0.21853810548782, 0.21641205251217, -0.21425846219063, 0.21207828819752, -0.20987255871296, 0.20764224231243, -0.20538838207722, 0.20311196148396, -0.20081403851509, 0.19849562644958, -0.19615775346756, 0.1938014626503, -0.19142781198025, 0.18903781473637, -0.18663254380226, 0.18421304225922, -0.18178035318851, 0.17933551967144, -0.17687959969044, 0.17441363632679, -0.17193868756294, 0.16945576667786, -0.16696594655514, 0.16447024047375, -0.16196969151497, 0.15946531295776, -0.15695814788342, 0.15444917976856, -0.15193943679333, 16266.05078125, 1432.0, 159.0, 0.15198889374733, -0.154357239604, 0.15672478079796, -0.15909068286419, 0.16145408153534, -0.16381411254406, 0.166169911623, -0.16852062940598, 0.17086537182331, -0.17320327460766, 0.17553345859051, -0.17785504460335, 0.18016713857651, -0.18246887624264, 0.18475936353207, -0.18703770637512, 0.18930301070213, -0.19155442714691, 0.19379104673862, -0.19601199030876, 0.19821636378765, -0.2004033178091, 0.20257195830345, -0.2047214359045, 0.20685084164143, -0.20895935595036, 0.21104609966278, -0.21311023831367, 0.21515090763569, -0.2171672731638, 0.21915851533413, -0.2211237847805, 0.22306229174137, -0.22497323155403, 0.22685578465462, -0.22870917618275, 0.23053261637688, -0.23232536017895, 0.23408661782742, -0.23581567406654, 0.23751178383827, -0.2391742169857, 0.24080228805542, -0.24239526689053, 0.24395249783993, -0.24547332525253, 0.24695706367493, -0.24840308725834, 0.249810770154, -0.25117951631546, 0.25250872969627, -0.25379782915115, 0.25504624843597, -0.25625348091125, 0.25741896033287, -0.25854218006134, 0.25962269306183, -0.26065999269485, 0.26165366172791, -0.26260322332382, 0.26350829005241, -0.26436844468117, 0.26518335938454, -0.26595264673233, 0.26667594909668, -0.26735299825668, 0.2679834663868, -0.26856708526611, 0.26910361647606, -0.26959282159805, 0.27003446221352, -0.27042838931084, 0.27077442407608, -0.27107238769531, 0.27132219076157, -0.27152371406555, 0.27167689800262, -0.27178162336349, 0.27183791995049, -0.27184572815895, 0.27180504798889, -0.27171590924263, 0.27157840132713, -0.2713925242424, 0.27115842700005, -0.27087616920471, 0.27054592967033, -0.2701678276062, 0.26974207162857, -0.26926884055138, 0.2687483727932, -0.26818084716797, 0.26756659150124, -0.26690584421158, 0.26619893312454, -0.26544615626335, 0.26464784145355, -0.26380440592766, 0.26291614770889, -0.26198354363441, 0.26100695133209, -0.25998684763908, 0.25892367959023, -0.25781789422035, 0.25666999816895, -0.25548049807549, 0.25424993038177, -0.25297883152962, 0.25166773796082, -0.25031724572182, 0.24892795085907, -0.24750044941902, 0.24603536725044, -0.2445333302021, 0.24299499392509, -0.24142102897167, 0.23981210589409, -0.23816892504692, 0.23649217188358, -0.23478257656097, 0.23304085433483, -0.23126776516438, 0.2294640392065, -0.22763043642044, 0.22576773166656, -0.22387671470642, 0.22195816040039, -0.22001285851002, 0.21804164350033, -0.21604530513287, 0.2140246629715, -0.21198056638241, 0.20991382002831, -0.20782528817654, 0.20571579039097, -0.20358619093895, 0.20143733918667, -0.19927008450031, 0.19708530604839, -0.1948838531971, 0.19266659021378, -0.19043438136578, 0.18818810582161, -0.18592861294746, 0.18365679681301, -0.18137350678444, 0.17907962203026, -0.17677602171898, 0.17446354031563, -0.17214305698872, 0.16981543600559, -0.16748152673244, 0.16514219343662, -0.16279828548431, 0.16045065224171, -0.15810011327267, 0.15574751794338, -0.15339371562004, 0.15103949606419, 16742.681640625, 1475.0, 161.0, -0.15207056701183, 0.15442641079426, -0.15678265690804, 0.15913847088814, -0.16149301826954, 0.16384544968605, -0.16619490087032, 0.16854050755501, -0.17088140547276, 0.17321671545506, -0.17554557323456, 0.17786708474159, -0.18018037080765, 0.18248456716537, -0.18477874994278, 0.18706206977367, -0.18933360278606, 0.1915924847126, -0.19383780658245, 0.1960686892271, -0.19828425347805, 0.20048359036446, -0.20266583561897, 0.20483009517193, -0.20697548985481, 0.20910117030144, -0.21120622754097, 0.21328982710838, -0.21535108983517, 0.21738916635513, -0.21940322220325, 0.22139239311218, -0.22335585951805, 0.22529280185699, -0.22720240056515, 0.22908383607864, -0.23093631863594, 0.23275905847549, -0.23455126583576, 0.23631219565868, -0.23804107308388, 0.23973715305328, -0.24139972031116, 0.24302804470062, -0.24462142586708, 0.24617916345596, -0.24770058691502, 0.24918502569199, -0.25063183903694, 0.25204038619995, -0.25341004133224, 0.2547402381897, -0.25603035092354, 0.25727984309196, -0.25848814845085, 0.2596547305584, -0.26077905297279, 0.26186066865921, -0.26289907097816, 0.26389381289482, -0.26484444737434, 0.26575055718422, -0.26661172509193, 0.2674275636673, -0.26819774508476, 0.26892191171646, -0.26959976553917, 0.27023097872734, -0.27081525325775, 0.27135238051414, -0.27184212207794, 0.27228423953056, -0.27267855405807, 0.27302485704422, -0.27332305908203, 0.2735730111599, -0.27377462387085, 0.2739277780056, -0.2740324139595, 0.27408853173256, -0.27409610152245, 0.27405512332916, -0.27396565675735, 0.2738276720047, -0.27364131808281, 0.27340668439865, -0.27312386035919, 0.27279299497604, -0.27241423726082, 0.27198779582977, -0.27151384949684, 0.27099266648293, -0.27042442560196, 0.26980945467949, -0.26914802193642, 0.26844045519829, -0.26768705248833, 0.2668881714344, -0.26604419946671, 0.26515555381775, -0.26422256231308, 0.26324573159218, -0.26222550868988, 0.2611623108387, -0.26005664467812, 0.25890901684761, -0.25771999359131, 0.25649005174637, -0.25521975755692, 0.2539097070694, -0.25256049633026, 0.25117272138596, -0.24974699318409, 0.24828395247459, -0.24678426980972, 0.24524858593941, -0.24367758631706, 0.24207198619843, -0.24043247103691, 0.23875975608826, -0.23705460131168, 0.23531772196293, -0.23354987800121, 0.23175184428692, -0.22992439568043, 0.22806830704212, -0.22618438303471, 0.22427342832088, -0.22233624756336, 0.220373660326, -0.21838650107384, 0.21637560427189, -0.21434180438519, 0.21228593587875, -0.2102088779211, 0.20811146497726, -0.20599456131458, 0.20385903120041, -0.20170573890209, 0.1995355784893, -0.19734938442707, 0.19514805078506, -0.1929324567318, 0.19070346653461, -0.18846195936203, 0.18620879948139, -0.18394488096237, 0.18167106807232, -0.17938822507858, 0.17709721624851, -0.17479893565178, 0.17249420285225, -0.17018391191959, 0.16786889731884, -0.16555000841618, 0.16322807967663, -0.16090397536755, 0.1585785150528, -0.15625250339508, 0.15392678976059, -0.15160216391087, 17233.28125, 1518.0, 167.0, 0.15127861499786, -0.15351049602032, 0.15574236214161, -0.15797351300716, 0.16020324826241, -0.16243082284927, 0.16465552151203, -0.1668766438961, 0.16909343004227, -0.17130516469479, 0.17351108789444, -0.17571048438549, 0.17790260910988, -0.18008670210838, 0.18226201832294, -0.18442782759666, 0.18658335506916, -0.18872785568237, 0.1908605992794, -0.19298081099987, 0.19508774578571, -0.19718065857887, 0.19925878942013, -0.20132139325142, 0.20336773991585, -0.20539706945419, 0.20740865170956, -0.20940174162388, 0.21137560904026, -0.21332950890064, 0.21526272594929, -0.21717454493046, 0.21906425058842, -0.2209310978651, 0.22277443110943, -0.22459350526333, 0.22638766467571, -0.22815619409084, 0.22989842295647, -0.23161368072033, 0.23330131173134, -0.2349606603384, 0.23659105598927, -0.23819190263748, 0.2397625297308, -0.24130234122276, 0.24281072616577, -0.24428708851337, 0.24573084712029, -0.24714140594006, 0.24851821362972, -0.24986071884632, 0.25116840004921, -0.25244066119194, 0.25367707014084, -0.2548770904541, 0.25604021549225, -0.25716599822044, 0.25825396180153, -0.25930362939835, 0.26031464338303, -0.26128652691841, 0.26221886277199, -0.26311132311821, 0.26396349072456, -0.26477500796318, 0.26554554700851, -0.2662747502327, 0.26696237921715, -0.267608076334, 0.26821157336235, -0.2687726020813, 0.26929095387459, -0.26976639032364, 0.27019870281219, -0.27058765292168, 0.27093315124512, -0.27123495936394, 0.27149295806885, -0.27170705795288, 0.27187711000443, -0.27200308442116, 0.27208486199379, -0.27212238311768, 0.27211567759514, -0.27206465601921, 0.27196937799454, -0.2718298137188, 0.27164605259895, -0.27141815423965, 0.2711461186409, -0.27083012461662, 0.27047023177147, -0.27006658911705, 0.26961934566498, -0.26912865042686, 0.26859471201897, -0.2680176794529, 0.26739782094955, -0.2667353451252, 0.26603052020073, -0.26528358459473, 0.26449486613274, -0.26366463303566, 0.26279324293137, -0.26188096404076, 0.26092821359634, -0.25993531942368, 0.25890269875526, -0.2578307390213, 0.25671982765198, -0.25557044148445, 0.25438299775124, -0.25315794348717, 0.25189578533173, -0.25059700012207, 0.24926207959652, -0.24789156019688, 0.24648596346378, -0.2450458407402, 0.24357172846794, -0.24206420779228, 0.24052385985851, -0.23895128071308, 0.2373470813036, -0.23571185767651, 0.23404625058174, -0.23235091567039, 0.23062646389008, -0.2288735806942, 0.22709292173386, -0.22528517246246, 0.22345100343227, -0.22159112989902, 0.21970625221729, -0.21779707074165, 0.21586430072784, -0.21390867233276, 0.21193091571331, -0.20993177592754, 0.20791199803352, -0.20587231218815, 0.20381347835064, -0.20173627138138, 0.19964143633842, -0.19752974808216, 0.19540196657181, -0.19325888156891, 0.19110125303268, -0.18892987072468, 0.18674550950527, -0.18454894423485, 0.18234096467495, -0.18012234568596, 0.17789387702942, -0.17565633356571, 0.17341050505638, -0.17115716636181, 0.16889709234238, -0.16663107275963, 0.16435986757278, -0.16208425164223, 0.1598050147295, -0.1575228869915, 0.15523867309093, -0.15295308828354, 0.1506669074297, 17738.25390625, 1562.0, 171.0, 0.15017007291317, -0.15242730081081, 0.15468463301659, -0.15694136917591, 0.15919674932957, -0.16145002841949, 0.1637004762888, -0.16594734787941, 0.16818988323212, -0.17042733728886, 0.17265893518925, -0.17488394677639, 0.17710158228874, -0.17931108176708, 0.18151170015335, -0.18370266258717, 0.18588320910931, -0.18805257976055, 0.19020999968052, -0.19235470890999, 0.19448594748974, -0.19660295546055, 0.1987049728632, -0.20079125463963, 0.20286105573177, -0.20491360127926, 0.20694817602634, -0.20896400511265, 0.21096038818359, -0.21293658018112, 0.21489185094833, -0.21682548522949, 0.21873676776886, -0.22062499821186, 0.22248946130276, -0.2243294864893, 0.2261443734169, -0.22793345153332, 0.22969603538513, -0.23143148422241, 0.23313915729523, -0.23481838405132, 0.23646855354309, -0.2380890250206, 0.23967921733856, -0.24123850464821, 0.24276632070541, -0.24426206946373, 0.24572518467903, -0.24715512990952, 0.24855133891106, -0.24991331994534, 0.25124052166939, -0.25253248214722, 0.25378865003586, -0.25500863790512, 0.2561919093132, -0.25733804702759, 0.25844660401344, -0.25951719284058, 0.2605494260788, -0.26154285669327, 0.26249715685844, -0.26341193914413, 0.26428690552711, -0.26512169837952, 0.26591601967812, -0.26666960120201, 0.26738214492798, -0.26805338263512, 0.26868307590485, -0.26927101612091, 0.26981699466705, -0.27032083272934, 0.27078232169151, -0.27120131254196, 0.2715776860714, -0.27191132307053, 0.27220210433006, -0.27244994044304, 0.27265477180481, -0.27281653881073, 0.27293518185616, -0.27301076054573, 0.27304318547249, -0.2730325460434, 0.27297884225845, -0.27288213372231, 0.2727424800396, -0.27256000041962, 0.27233475446701, -0.27206689119339, 0.27175655961037, -0.27140390872955, 0.27100908756256, -0.27057230472565, 0.27009373903275, -0.26957365870476, 0.26901230216026, -0.26840987801552, 0.26776668429375, -0.26708301901817, 0.2663591504097, -0.26559543609619, 0.26479217410088, -0.26394972205162, 0.26306846737862, -0.26214873790741, 0.26119098067284, -0.26019558310509, 0.25916293263435, -0.25809347629547, 0.2569876909256, -0.25584602355957, 0.25466892123222, -0.25345689058304, 0.2522104382515, -0.25093004107475, 0.24961625039577, -0.24826957285404, 0.24689057469368, -0.24547979235649, 0.2440377920866, -0.2425651550293, 0.24106246232986, -0.23953031003475, 0.23796929419041, -0.23638002574444, 0.23476313054562, -0.23311921954155, 0.23144894838333, -0.22975294291973, 0.228031873703, -0.22628636658192, 0.22451710700989, -0.22272475063801, 0.22090996801853, -0.21907344460487, 0.21721586585045, -0.21533791720867, 0.21344029903412, -0.21152368187904, 0.20958878099918, -0.20763629674911, 0.20566692948341, -0.20368137955666, 0.20168036222458, -0.19966459274292, 0.19763475656509, -0.19559159874916, 0.19353580474854, -0.19146808981895, 0.18938916921616, -0.18729975819588, 0.18520055711269, -0.18309226632118, 0.18097560107708, -0.17885126173496, 0.17671994864941, -0.17458236217499, 0.17243920266628, -0.17029114067554, 0.16813887655735, -0.16598309576511, 0.16382446885109, -0.16166366636753, 0.15950137376785, -0.15733823180199, 0.15517492592335, -0.15301208198071, 0.15085035562515, 18258.025390625, 1609.0, 175.0, -0.1501366943121, 0.15226155519485, -0.15438757836819, 0.15651413798332, -0.15864062309265, 0.16076643764973, -0.16289094090462, 0.16501350700855, -0.1671334952116, 0.16925027966499, -0.1713632196188, 0.17347167432308, -0.17557497322559, 0.17767249047756, -0.17976355552673, 0.18184751272202, -0.18392372131348, 0.18599151074886, -0.18805021047592, 0.19009916484356, -0.19213770329952, 0.19416515529156, -0.19618088006973, 0.19818419218063, -0.20017442107201, 0.20215092599392, -0.20411302149296, 0.20606005191803, -0.20799136161804, 0.20990628004074, -0.21180415153503, 0.21368432044983, -0.21554616093636, 0.2173889875412, -0.21921217441559, 0.22101508080959, -0.22279706597328, 0.22455748915672, -0.22629573941231, 0.22801119089127, -0.22970321774483, 0.23137120902538, -0.23301456868649, 0.23463268578053, -0.23622496426105, 0.23779083788395, -0.23932972550392, 0.24084104597569, -0.24232423305511, 0.24377875030041, -0.2452040463686, 0.24659956991673, -0.24796481430531, 0.24929924309254, -0.2506023645401, 0.25187364220619, -0.25311264395714, 0.25431886315346, -0.25549182295799, 0.25663110613823, -0.25773620605469, 0.25880673527718, -0.25984224677086, 0.26084235310555, -0.26180666685104, 0.26273477077484, -0.26362627744675, 0.26448088884354, -0.26529821753502, 0.26607793569565, -0.26681971549988, 0.26752325892448, -0.26818829774857, 0.2688145339489, -0.26940169930458, 0.26994952559471, -0.27045780420303, 0.27092632651329, -0.2713548541069, 0.27174323797226, -0.27209123969078, 0.2723987698555, -0.27266564965248, 0.27289173007011, -0.27307692170143, 0.27322110533714, -0.2733242213726, 0.27338621020317, -0.27340698242188, 0.27338653802872, -0.27332481741905, 0.2732218503952, -0.27307763695717, 0.27289220690727, -0.27266559004784, 0.27239784598351, -0.27208909392357, 0.27173936367035, -0.27134877443314, 0.27091747522354, -0.27044558525085, 0.26993325352669, -0.26938065886497, 0.26878798007965, -0.26815542578697, 0.2674832046032, -0.2667715549469, 0.26602071523666, -0.26523092389107, 0.26440250873566, -0.26353570818901, 0.26263085007668, -0.2616882622242, 0.26070827245712, -0.259691208601, 0.25863745808601, -0.25754740834236, 0.25642141699791, -0.25525987148285, 0.25406324863434, -0.25283193588257, 0.25156638026237, -0.25026702880859, 0.24893437325954, -0.24756887555122, 0.24617102742195, -0.24474133551121, 0.24328032135963, -0.24178849160671, 0.24026639759541, -0.23871457576752, 0.23713359236717, -0.2355240136385, 0.23388640582561, -0.23222136497498, 0.23052948713303, -0.22881136834621, 0.22706763446331, -0.22529889643192, 0.22350578010082, -0.2216889411211, 0.21984899044037, -0.21798661351204, 0.21610243618488, -0.21419715881348, 0.21227142214775, -0.21032589673996, 0.20836129784584, -0.20637826621532, 0.20437753200531, -0.20235976576805, 0.20032566785812, -0.19827595353127, 0.19621130824089, -0.19413244724274, 0.19204008579254, -0.18993492424488, 0.18781769275665, -0.18568907678127, 0.18354983627796, -0.18140065670013, 0.17924225330353, -0.17707535624504, 0.17490068078041, -0.17271892726421, 0.17053082585335, -0.16833709180355, 0.1661384254694, -0.16393554210663, 0.16172914206982, -0.15951992571354, 0.15730860829353, -0.15509589016438, 0.15288244187832, -0.15066896378994, 18793.025390625, 1655.0, 181.0, -0.15038453042507, 0.15251018106937, -0.15463519096375, 0.15675893425941, -0.15888081490993, 0.16100019216537, -0.16311646997929, 0.1652290225029, -0.1673372387886, 0.16944047808647, -0.17153811454773, 0.17362952232361, -0.1757140904665, 0.17779117822647, -0.17986015975475, 0.18192040920258, -0.18397128582001, 0.18601217865944, -0.18804244697094, 0.19006146490574, -0.19206862151623, 0.19406329095364, -0.19604483246803, 0.19801265001297, -0.19996611773968, 0.20190462470055, -0.20382754504681, 0.20573429763317, -0.20762425661087, 0.20949684083462, -0.2113514393568, 0.21318745613098, -0.21500432491302, 0.21680144965649, -0.21857826411724, 0.22033418715, -0.22206865251064, 0.2237811088562, -0.22547100484371, 0.22713780403137, -0.22878094017506, 0.23039990663528, -0.23199415206909, 0.23356318473816, -0.23510649800301, 0.23662357032299, -0.23811390995979, 0.23957705497742, -0.24101249873638, 0.24241979420185, -0.24379847943783, 0.24514812231064, -0.24646824598312, 0.24775846302509, -0.24901832640171, 0.25024744868279, -0.25144538283348, 0.25261181592941, -0.25374633073807, 0.25484853982925, -0.25591811537743, 0.25695472955704, -0.25795802474022, 0.25892767310143, -0.25986337661743, 0.26076483726501, -0.26163178682327, 0.26246389746666, -0.26326099038124, 0.26402273774147, -0.26474893093109, 0.26543936133385, -0.26609379053116, 0.26671203970909, -0.26729393005371, 0.26783925294876, -0.26834788918495, 0.26881965994835, -0.26925441622734, 0.26965206861496, -0.27001249790192, 0.27033561468124, -0.27062132954597, 0.27086955308914, -0.27108025550842, 0.2712534070015, -0.27138891816139, 0.27148681879044, -0.27154710888863, 0.27156978845596, -0.27155485749245, 0.2715023458004, -0.27141234278679, 0.27128490805626, -0.27112007141113, 0.2709179520607, -0.27067863941193, 0.2704022526741, -0.27008891105652, 0.26973876357079, -0.26935195922852, 0.26892864704132, -0.26846897602081, 0.26797318458557, -0.26744148135185, 0.26687401533127, -0.26627105474472, 0.26563280820847, -0.26495954394341, 0.26425150036812, -0.26350897550583, 0.26273220777512, -0.26192152500153, 0.26107722520828, -0.26019960641861, 0.25928899645805, -0.25834572315216, 0.2573701441288, -0.25636258721352, 0.2553234398365, -0.25425308942795, 0.25315189361572, -0.25202023983002, 0.25085851550102, -0.24966718256474, 0.24844661355019, -0.24719725549221, 0.24591954052448, -0.24461390078068, 0.24328079819679, -0.24192069470882, 0.24053403735161, -0.23912131786346, 0.23768299818039, -0.2362195700407, 0.23473154008389, -0.23321938514709, 0.23168362677097, -0.23012475669384, 0.22854329645634, -0.22693978250027, 0.22531470656395, -0.22366863489151, 0.22200208902359, -0.22031559050083, 0.21860970556736, -0.21688497066498, 0.21514193713665, -0.21338115632534, 0.21160317957401, -0.20980855822563, 0.20799787342548, -0.20617167651653, 0.2043305337429, -0.20247501134872, 0.20060567557812, -0.19872309267521, 0.19682784378529, -0.19492049515247, 0.1930016130209, -0.19107177853584, 0.18913154304028, -0.18718148767948, 0.18522219359875, -0.1832542270422, 0.1812781393528, -0.17929451167583, 0.17730391025543, -0.17530690133572, 0.17330403625965, -0.17129588127136, 0.16928300261497, -0.16726593673229, 0.16524524986744, -0.16322149336338, 0.16119520366192, -0.15916693210602, 0.15713720023632, -0.15510655939579, 0.15307554602623, -0.15104468166828, 19343.703125, 1703.0, 188.0, -0.1500493735075, 0.15205477178097, -0.1540619134903, 0.15607024729252, -0.15807929635048, 0.16008850932121, -0.16209736466408, 0.16410532593727, -0.16611185669899, 0.16811643540859, -0.17011849582195, 0.17211750149727, -0.17411290109158, 0.17610414326191, -0.17809066176414, 0.18007192015648, -0.18204733729362, 0.18401637673378, -0.1859784424305, 0.18793299794197, -0.18987946212292, 0.19181726872921, -0.19374585151672, 0.19566462934017, -0.19757306575775, 0.19947057962418, -0.201356574893, 0.20323053002357, -0.2050918340683, 0.20693995058537, -0.20877431333065, 0.21059434115887, -0.21239949762821, 0.2141892015934, -0.21596290171146, 0.2177200615406, -0.21946009993553, 0.22118249535561, -0.22288669645786, 0.22457213699818, -0.22623832523823, 0.22788469493389, -0.22951072454453, 0.23111589252949, -0.23269966244698, 0.23426155745983, -0.23580104112625, 0.23731760680676, -0.23881077766418, 0.2402800321579, -0.24172492325306, 0.24314494431019, -0.24453963339329, 0.2459085136652, -0.24725113809109, 0.24856705963612, -0.24985583126545, 0.25111702084541, -0.25235021114349, 0.25355494022369, -0.25473085045815, 0.25587752461433, -0.25699454545975, 0.25808158516884, -0.25913819670677, 0.26016408205032, -0.2611588537693, 0.26212215423584, -0.26305368542671, 0.26395308971405, -0.26482006907463, 0.26565432548523, -0.26645556092262, 0.26722347736359, -0.26795783638954, 0.26865833997726, -0.2693247795105, 0.26995685696602, -0.27055442333221, 0.27111721038818, -0.27164500951767, 0.27213767170906, -0.2725949883461, 0.27301681041718, -0.27340295910835, 0.27375331521034, -0.27406775951385, 0.27434611320496, -0.27458834648132, 0.27479431033134, -0.27496394515038, 0.27509719133377, -0.27519398927689, 0.27525427937508, -0.27527803182602, 0.27526527643204, -0.27521595358849, 0.27513006329536, -0.27500769495964, 0.27484881877899, -0.27465349435806, 0.27442181110382, -0.27415382862091, 0.27384957671165, -0.27350923418999, 0.27313286066055, -0.27272057533264, 0.27227255702019, -0.27178889513016, 0.27126979827881, -0.27071538567543, 0.2701258957386, -0.26950147747993, 0.26884236931801, -0.26814877986908, 0.26742094755173, -0.26665911078453, 0.26586350798607, -0.26503443717957, 0.26417216658592, -0.26327696442604, 0.26234912872314, -0.26138898730278, 0.26039686799049, -0.25937309861183, 0.25831800699234, -0.25723195075989, 0.25611528754234, -0.2549684047699, 0.25379168987274, -0.25258553028107, 0.25135031342506, -0.25008645653725, 0.24879437685013, -0.24747450649738, 0.24612727761269, -0.24475315213203, 0.2433525621891, -0.24192598462105, 0.24047388136387, -0.23899672925472, 0.23749502003193, -0.23596923053265, 0.23441986739635, -0.23284743726254, 0.23125244677067, -0.2296354174614, 0.2279968559742, -0.22633731365204, 0.22465731203556, -0.22295738756657, 0.22123809158802, -0.21949996054173, 0.21774354577065, -0.21596942842007, 0.21417813003063, -0.21237024664879, 0.2105463296175, -0.20870694518089, 0.20685268938541, -0.20498409867287, 0.20310178399086, -0.20120629668236, 0.19929824769497, -0.19737818837166, 0.19544671475887, -0.19350442290306, 0.19155186414719, -0.18958966434002, 0.18761837482452, -0.18563859164715, 0.18365089595318, -0.1816558688879, 0.1796540915966, -0.17764616012573, 0.17563262581825, -0.17361408472061, 0.17159110307693, -0.16956426203251, 0.16753412783146, -0.16550126671791, 0.16346623003483, -0.16142958402634, 0.15939190983772, -0.15735372900963, 0.15531559288502, -0.15327805280685, 0.1512416601181, 19910.517578125, 1751.0, 196.0, -0.15015748143196, 0.15207713842392, -0.15399625897408, 0.15591436624527, -0.15783102810383, 0.15974578261375, -0.16165819764137, 0.16356782615185, -0.16547419130802, 0.16737684607506, -0.16927532851696, 0.17116920650005, -0.17305798828602, 0.17494122684002, -0.17681847512722, 0.17868925631046, -0.18055310845375, 0.18240958452225, -0.18425820767879, 0.18609853088856, -0.18793009221554, 0.18975242972374, -0.19156508147717, 0.19336758553982, -0.19515949487686, 0.1969403475523, -0.19870968163013, 0.20046706497669, -0.20221203565598, 0.20394414663315, -0.20566293597221, 0.2073679715395, -0.20905882120132, 0.2107350230217, -0.21239614486694, 0.21404176950455, -0.21567144989967, 0.21728475391865, -0.21888126432896, 0.22046054899693, -0.2220222055912, 0.22356580197811, -0.22509095072746, 0.22659721970558, -0.22808423638344, 0.22955156862736, -0.23099884390831, 0.2324256747961, -0.23383167386055, 0.23521645367146, -0.23657964169979, 0.23792088031769, -0.23923979699612, 0.24053604900837, -0.24180926382542, 0.24305909872055, -0.24428521096706, 0.24548728764057, -0.2466649711132, 0.24781796336174, -0.24894593656063, 0.25004857778549, -0.25112557411194, 0.25217664241791, -0.2532015144825, 0.25419986248016, -0.25517144799232, 0.25611600279808, -0.25703322887421, 0.25792288780212, -0.25878474116325, 0.25961855053902, -0.26042407751083, 0.26120111346245, -0.26194941997528, 0.26266878843307, -0.2633590400219, 0.26401993632317, -0.26465135812759, 0.2652530670166, -0.26582491397858, 0.26636677980423, -0.26687842607498, 0.26735979318619, -0.26781070232391, 0.26823100447655, -0.26862064003944, 0.26897946000099, -0.2693073451519, 0.26960423588753, -0.2698700428009, 0.27010467648506, -0.27030807733536, 0.27048015594482, -0.27062091231346, 0.2707302570343, -0.27080819010735, 0.27085468173027, -0.27086970210075, 0.2708532512188, -0.27080529928207, 0.27072590589523, -0.27061507105827, 0.27047282457352, -0.27029916644096, 0.27009418606758, -0.26985791325569, 0.26959043741226, -0.26929178833961, 0.26896205544472, -0.26860135793686, 0.26820975542068, -0.26778736710548, 0.26733428239822, -0.26685065031052, 0.26633661985397, -0.26579228043556, 0.26521778106689, -0.2646133005619, 0.26397898793221, -0.26331502199173, 0.26262158155441, -0.26189884543419, 0.26114699244499, -0.2603662610054, 0.25955682992935, -0.2587189078331, 0.25785276293755, -0.25695860385895, 0.25603663921356, -0.25508716702461, 0.25411039590836, -0.25310662388802, 0.25207611918449, -0.25101912021637, 0.24993593990803, -0.24882687628269, 0.2476921826601, -0.24653220176697, 0.24534723162651, -0.24413758516312, 0.24290357530117, -0.24164554476738, 0.24036382138729, -0.23905874788761, 0.23773066699505, -0.23637992143631, 0.23500689864159, -0.23361192643642, 0.23219540715218, -0.23075768351555, 0.22929915785789, -0.22782020270824, 0.22632122039795, -0.22480258345604, 0.22326470911503, -0.22170799970627, 0.22013284265995, -0.21853968501091, 0.21692891418934, -0.21530097723007, 0.21365627646446, -0.21199524402618, 0.21031832695007, -0.2086259573698, 0.20691856741905, -0.20519660413265, 0.20346051454544, -0.20171074569225, 0.19994774460793, -0.19817198812962, 0.196383908391, -0.19458399713039, 0.19277268648148, -0.1909504532814, 0.18911777436733, -0.18727511167526, 0.18542294204235, -0.18356174230576, 0.18169197440147, -0.17981413006783, 0.17792867124081, -0.17603608965874, 0.17413687705994, -0.1722314953804, 0.17032043635845, -0.16840417683125, 0.16648322343826, -0.1645580381155, 0.16262911260128, -0.16069692373276, 0.15876199305058, -0.15682476758957, 0.15488573908806, -0.15294541418552, 0.15100426971912, 20493.939453125, 1805.0, 228.0, -0.15135942399502, 0.15326069295406, -0.1551628857851, 0.15706552565098, -0.15896815061569, 0.16087031364441, -0.16277153789997, 0.16467136144638, -0.16656929254532, 0.16846485435963, -0.17035758495331, 0.17224699258804, -0.17413260042667, 0.17601391673088, -0.17789043486118, 0.17976170778275, -0.18162719905376, 0.18348644673824, -0.1853389441967, 0.18718421459198, -0.18902173638344, 0.19085103273392, -0.19267159700394, 0.19448295235634, -0.19628457725048, 0.19807600975037, -0.19985672831535, 0.20162625610828, -0.20338410139084, 0.2051297724247, -0.20686276257038, 0.20858260989189, -0.21028882265091, 0.21198090910912, -0.21365839242935, 0.21532079577446, -0.21696765720844, 0.21859848499298, -0.22021283209324, 0.22181022167206, -0.22339019179344, 0.22495229542255, -0.22649605572224, 0.22802105545998, -0.22952683269978, 0.23101295530796, -0.23247899115086, 0.23392452299595, -0.2353491038084, 0.23675231635571, -0.23813377320766, 0.23949305713177, -0.24082978069782, 0.24214352667332, -0.24343393743038, 0.24470062553883, -0.24594320356846, 0.24716132879257, -0.2483546435833, 0.24952279031277, -0.25066542625427, 0.25178223848343, -0.25287288427353, 0.25393703579903, -0.25497442483902, 0.25598472356796, -0.25696766376495, 0.25792294740677, -0.25885030627251, 0.25974947214127, -0.26062020659447, 0.26146227121353, -0.26227542757988, 0.26305943727493, -0.26381412148476, 0.26453924179077, -0.26523464918137, 0.26590010523796, -0.26653549075127, 0.26714065670967, -0.26771539449692, 0.26825961470604, -0.26877316832542, 0.26925593614578, -0.26970782876015, 0.27012875676155, -0.27051866054535, 0.27087742090225, -0.27120497822762, 0.27150133252144, -0.27176642417908, 0.27200025320053, -0.27220275998116, 0.2723740041256, -0.27251395583153, 0.27262264490128, -0.27270010113716, 0.27274641394615, -0.27276161313057, 0.27274578809738, -0.27269899845123, 0.27262136340141, -0.27251297235489, 0.27237397432327, -0.27220448851585, 0.27200463414192, -0.27177461981773, 0.27151456475258, -0.27122467756271, 0.2709051668644, -0.27055618166924, 0.27017799019814, -0.26977080106735, 0.26933485269547, -0.26887041330338, 0.26837772130966, -0.26785704493523, 0.26730871200562, -0.26673296093941, 0.26613014936447, -0.26550057530403, 0.26484456658363, -0.26416245102882, 0.26345461606979, -0.26272138953209, 0.2619631588459, -0.26118031144142, 0.26037320494652, -0.25954228639603, 0.25868794322014, -0.25781059265137, 0.25691068172455, -0.25598865747452, 0.25504493713379, -0.25407999753952, 0.25309428572655, -0.25208833813667, 0.25106257200241, -0.25001749396324, 0.24895364046097, -0.24787148833275, 0.24677155911922, -0.2456543892622, 0.24452048540115, -0.24337039887905, 0.2422046661377, -0.24102385342121, 0.23982851207256, -0.23861919343472, 0.23739646375179, -0.23616091907024, 0.23491314053535, -0.23365367949009, 0.23238316178322, -0.23110215365887, 0.22981128096581, -0.22851112484932, 0.22720231115818, -0.22588542103767, 0.22456109523773, -0.22322994470596, 0.22189258038998, -0.22054962813854, 0.21920171380043, -0.21784946322441, 0.21649350225925, -0.21513445675373, 0.21377296745777, -0.21240966022015, 0.21104516088963, -0.20968009531498, 0.2083151191473, -0.20695085823536, 0.20558792352676, -0.20422697067261, 0.2028686106205, -0.20151348412037, 0.20016220211983, -0.1988154053688, 0.19747370481491, -0.19613772630692, 0.19480809569359, -0.19348539412022, 0.19217027723789, -0.19086331129074, 0.18956513702869, -0.18827632069588, 0.1869974732399, -0.18572919070721, 0.18447203934193, -0.18322661519051, 0.18199348449707, -0.18077321350574, 0.17956636846066, -0.17837351560593, 0.17719519138336, -0.17603194713593, 0.17488431930542, -0.17375282943249, 0.17263799905777, -0.17154034972191, 0.17046038806438, -0.16939860582352, 0.16835549473763, -0.16733153164387, 0.1663271933794, -0.16534294188023, 0.16437922418118, -0.16343650221825, 0.16251519322395, -0.16161572933197, 0.16073852777481, -0.15988399088383, 0.15905250608921, -0.15824446082115, 0.15746022760868, -0.15670016407967, 0.15596462786198, -0.15525394678116, 0.15456846356392, -0.15390847623348, 0.15327431261539, -0.15266624093056, 0.15208455920219, -0.15152952075005, 0.15100139379501, -0.15050041675568, 0.15002682805061, 21094.458984375, 1857.0, 190.0, -0.1511165201664, 0.15294866263866, -0.1547829657793, 0.15661919116974, -0.1584570556879, 0.16029630601406, -0.16213665902615, 0.16397787630558, -0.1658196747303, 0.16766180098057, -0.16950398683548, 0.1713459789753, -0.17318750917912, 0.1750283241272, -0.17686815559864, 0.1787067502737, -0.18054383993149, 0.18237918615341, -0.18421252071857, 0.18604359030724, -0.18787214159966, 0.18969793617725, -0.19152069091797, 0.19334019720554, -0.19515618681908, 0.19696842133999, -0.1987766623497, 0.20058064162731, -0.20238016545773, 0.20417495071888, -0.20596480369568, 0.20774945616722, -0.20952869951725, 0.21130231022835, -0.21307003498077, 0.21483168005943, -0.21658702194691, 0.21833582222462, -0.22007788717747, 0.22181299328804, -0.22354093194008, 0.22526150941849, -0.22697450220585, 0.22867973148823, -0.23037697374821, 0.23206606507301, -0.23374678194523, 0.23541896045208, -0.23708240687847, 0.23873694241047, -0.24038238823414, 0.24201858043671, -0.24364532530308, 0.24526245892048, -0.2468698322773, 0.24846728146076, -0.25005462765694, 0.25163176655769, -0.25319847464561, 0.25475469231606, -0.25630018115044, 0.25783488154411, -0.25935861468315, 0.26087129116058, -0.26237270236015, 0.26386281847954, -0.2653414607048, 0.26680850982666, -0.26826390624046, 0.26970747113228, -0.27113914489746, 0.27255880832672, -0.27396637201309, 0.27536174654961, -0.27674481272697, 0.27811551094055, -0.27947375178337, 0.28081944584846, -0.28215256333351, 0.2834729552269, -0.2847805917263, 0.28607541322708, -0.28735736012459, 0.28862637281418, -0.28988239169121, 0.29112538695335, -0.29235526919365, 0.29357203841209, -0.29477560520172, 0.29596599936485, -0.29714313149452, 0.29830700159073, -0.29945755004883, 0.30059480667114, -0.30171871185303, 0.30282926559448, -0.30392646789551, 0.30501025915146, -0.30608066916466, 0.3071376979351, -0.30818131566048, 0.3092115521431, -0.31022840738297, 0.31123188138008, -0.31222197413445, 0.31319871544838, -0.31416213512421, 0.3151122033596, -0.31604897975922, 0.31697246432304, -0.31788268685341, 0.31877970695496, -0.31966349482536, 0.3205341398716, -0.32139164209366, 0.32223603129387, -0.3230673968792, 0.32388570904732, -0.3246910572052, 0.32548347115517, -0.32626298069954, 0.32702967524529, -0.3277835547924, 0.32852467894554, -0.32925313711166, 0.32996892929077, -0.33067214488983, 0.33136284351349, -0.33204105496407, 0.33270683884621, -0.33336028456688, 0.33400139212608, -0.33463028073311, 0.33524698019028, -0.33585157990456, 0.33644410967827, -0.33702462911606, 0.33759322762489, -0.33814996480942, 0.33869490027428, -0.33922809362411, 0.33974957466125, -0.34025949239731, 0.34075781702995, -0.3412446975708, 0.34172013401985, -0.34218421578407, 0.34263700246811, -0.34307855367661, 0.34350895881653, -0.34392821788788, 0.34433647990227, -0.3447337448597, 0.34512007236481, -0.34549555182457, 0.34586024284363, -0.3462141752243, 0.34655743837357, -0.34689006209373, 0.34721210598946, -0.34752362966537, 0.34782469272614, -0.34811535477638, 0.34839564561844, -0.34866565465927, 0.34892535209656, -0.34917485713959, 0.34941419959068, -0.34964340925217, 0.34986254572868, -0.35007163882256, 0.35027074813843, -0.3504598736763, 0.35063907504082, -0.3508083820343, 0.3509678542614, -0.35111746191978, 0.35125732421875, -0.35138738155365, 0.35150769352913, -0.35161831974983, 0.35171923041344, -0.35181048512459, 0.35189205408096, -0.35196402668953, 0.35202634334564, -0.35207906365395, 0.35212215781212, -0.3521556854248, 0.352179646492, 21712.572265625, 1892.0, 155.0, 0.15210801362991, -0.15473480522633, 0.15738296508789, -0.16005225479603, 0.16274234652519, -0.16545298695564, 0.16818386316299, -0.17093466222286, 0.17370507121086, -0.17649476230145, 0.17930340766907, -0.18213066458702, 0.18497617542744, -0.18783958256245, 0.19072054326534, -0.19361865520477, 0.19653353095055, -0.19946481287479, 0.202412083745, -0.20537492632866, 0.20835293829441, -0.21134570240974, 0.21435278654099, -0.2173737436533, 0.22040814161301, -0.22345551848412, 0.22651542723179, -0.22958739101887, 0.23267094790936, -0.23576562106609, 0.2388709038496, -0.24198631942272, 0.24511136114597, -0.24824552237988, 0.25138831138611, -0.25453916192055, 0.2576976120472, -0.2608630657196, 0.26403504610062, -0.26721295714378, 0.27039629220963, -0.27358451485634, 0.27677699923515, -0.27997323870659, 0.2831726372242, -0.28637462854385, 0.28957861661911, -0.29278406500816, 0.29599037766457, -0.29919692873955, 0.30240315198898, -0.3056084215641, 0.30881217122078, -0.31201377511024, 0.31521263718605, -0.31840813159943, 0.32159966230392, -0.32478657364845, 0.32796829938889, -0.33114418387413, 0.33431360125542, -0.3374759554863, 0.34063056111336, -0.34377682209015, 0.34691414237022, -0.35004183650017, 0.35315927863121, -0.35626584291458, 0.35936090350151, -0.36244380474091, 0.36551395058632, -0.36857065558434, 0.37161329388618, -0.3746412396431, 0.3776538670063, -0.38065055012703, 0.38363060355186, -0.38659343123436, 0.38953840732574, -0.39246490597725, 0.39537227153778, -0.39825990796089, 0.40112715959549, -0.4039734005928, 0.40679806470871, -0.40960049629211, 0.41238006949425, -0.41513621807098, 0.41786828637123, -0.42057567834854, 0.42325782775879, -0.42591413855553, 0.42854395508766, -0.43114677071571, 0.43372192978859, -0.43626889586449, 0.43878710269928, -0.44127595424652, 0.44373488426208, -0.44616335630417, 0.44856083393097, -0.45092672109604, 0.4532605111599, -0.45556163787842, 0.45782962441444, -0.46006390452385, 0.46226397156715, -0.46442931890488, 0.46655946969986, -0.46865391731262, 0.47071212530136, -0.47273370623589, 0.47471809387207, -0.47666490077972, 0.47857362031937, -0.48044383525848, 0.48227509856224, -0.48406699299812, 0.48581904172897, -0.48753091692924, 0.48920214176178, -0.49083232879639, 0.49242115020752, -0.49396815896034, 0.49547302722931, -0.49693539738655, 0.4983549118042, -0.49973124265671, 0.50106400251389, -0.50235295295715, 0.50359779596329, -0.50479817390442, 0.50595378875732, -0.50706440210342, 0.50812971591949, -0.5091495513916, 0.51012355089188, -0.51105159521103, 0.51193338632584, -0.51276868581772, 0.51355737447739, -0.51429921388626, 0.51499402523041, -0.51564168930054, 0.51624196767807, -0.51679480075836, 0.51730000972748, -0.51775741577148, 0.51816701889038, -0.51852864027023, 0.51884227991104, -0.51910775899887, 0.51932501792908, -0.5194941163063, 0.51961487531662 ];
    
    
    //8429
    self.qdata4096sr48000 = [ 48000.0, 4096.0, 171.0, 174.60000610352, 15.0, 1.0, -0.2693809568882, 179.71617126465, 15.0, 2.0, -0.24882070720196, 0.19288519024849, 184.98225402832, 15.0, 2.0, -0.17150577902794, 0.26288852095604, 190.40264892578, 16.0, 2.0, 0.26020601391792, -0.18330301344395, 195.98187255859, 16.0, 2.0, 0.19230562448502, -0.25884342193604, 201.72457885742, 17.0, 2.0, -0.26391145586967, 0.18535169959068, 207.63555908203, 17.0, 2.0, -0.20080491900444, 0.25975948572159, 213.71974182129, 18.0, 2.0, 0.26318848133087, -0.19757387042046, 219.98220825195, 18.0, 2.0, 0.19906717538834, -0.26462915539742, 226.42819213867, 19.0, 2.0, -0.25809490680695, 0.21754509210587, 233.06303405762, 19.0, 3.0, -0.18798840045929, 0.27005809545517, -0.1514755487442, 239.8923034668, 20.0, 2.0, 0.24659076333046, -0.24112845957279, 246.92169189453, 20.0, 3.0, 0.16798906028271, -0.27088734507561, 0.19036713242531, 254.15704345703, 21.0, 2.0, -0.22600574791431, 0.26188683509827, 261.60440063477, 22.0, 2.0, 0.26126518845558, -0.23044043779373, 269.27001953125, 22.0, 3.0, 0.19463367760181, -0.2714549601078, 0.18917514383793, 277.16021728516, 23.0, 2.0, -0.23653145134449, 0.26138982176781, 285.28164672852, 23.0, 3.0, -0.15347231924534, 0.26175802946091, -0.23863074183464, 293.64102172852, 24.0, 3.0, 0.1957034766674, -0.27119755744934, 0.2102862149477, 302.24536132812, 25.0, 3.0, -0.22867354750633, 0.26850089430809, -0.18152268230915, 311.1018371582, 26.0, 3.0, 0.25129744410515, -0.25802665948868, 0.15550011396408, 320.21780395508, 26.0, 3.0, 0.17557907104492, -0.26452425122261, 0.24369774758816, 329.60092163086, 27.0, 3.0, -0.20237170159817, 0.27044489979744, -0.22845384478569, 339.25894165039, 28.0, 3.0, 0.22305591404438, -0.2713907957077, 0.2142054438591, 349.20001220703, 29.0, 3.0, -0.23828302323818, 0.26940342783928, -0.20220845937729, 359.4323425293, 29.0, 4.0, -0.15582753717899, 0.24883738160133, -0.26618787646294, 0.1929145604372, 369.96450805664, 30.0, 4.0, 0.171487018466, -0.25582846999168, 0.26290875673294, -0.18657928705215, 380.80529785156, 31.0, 4.0, -0.18357941508293, 0.26021760702133, -0.2603212594986, 0.18329665064812, 391.96374511719, 32.0, 4.0, 0.1923376172781, -0.26274493336678, 0.25885906815529, -0.18297982215881, 403.44915771484, 33.0, 4.0, -0.19797597825527, 0.26392543315887, -0.25869479775429, 0.18538714945316, 415.27111816406, 34.0, 4.0, 0.20079065859318, -0.26405122876167, 0.25978130102158, -0.19031119346619, 427.43948364258, 35.0, 4.0, -0.2010992616415, 0.26320421695709, -0.26189050078392, 0.19757102429867, 439.96441650391, 36.0, 4.0, 0.19905166327953, -0.26129749417305, 0.26465377211571, -0.20682084560394, 452.85638427734, 37.0, 4.0, -0.19462931156158, 0.25810784101486, -0.26759359240532, 0.21755039691925, 466.12606811523, 38.0, 5.0, 0.18796849250793, -0.25332778692245, 0.27008506655693, -0.22924394905567, 0.15145739912987, 479.78460693359, 39.0, 5.0, -0.17910626530647, 0.24661301076412, -0.27143201231956, 0.24115374684334, -0.17032028734684, 493.84338378906, 40.0, 5.0, 0.16796335577965, -0.23757690191269, 0.27091297507286, -0.25238054990768, 0.19036176800728, 508.31408691406, 41.0, 5.0, -0.15494768321514, 0.22603632509708, -0.26774251461029, 0.26190599799156, -0.21086667478085, 523.20880126953, 43.0, 5.0, -0.21171262860298, 0.26128417253494, -0.26863813400269, 0.23047187924385, -0.16230119764805, 538.5400390625, 44.0, 5.0, 0.19467717409134, -0.25099670886993, 0.27147164940834, -0.24783775210381, 0.18922005593777, 554.32043457031, 45.0, 5.0, -0.17500330507755, 0.23653073608875, -0.26944380998611, 0.26141962409019, -0.21527923643589, 570.56329345703, 46.0, 6.0, 0.15343990921974, -0.21799865365028, 0.26177769899368, -0.26965510845184, 0.23864908516407, -0.1794930100441, 587.28204345703, 48.0, 5.0, 0.19575054943562, -0.24816271662712, 0.27121594548225, -0.25707393884659, 0.21032778918743, 604.49072265625, 49.0, 6.0, -0.17035955190659, 0.22866885364056, -0.26521280407906, 0.26853615045547, -0.23742029070854, 0.18150974810123, 622.20367431641, 51.0, 6.0, -0.20410193502903, 0.25130927562714, -0.27133691310883, 0.25805813074112, -0.21533252298832, 0.15547569096088, 640.43560791016, 52.0, 6.0, 0.17563754320145, -0.22997783124447, 0.26454594731331, -0.26965987682343, 0.2437304854393, -0.19395442306995, 659.20184326172, 54.0, 6.0, 0.20242129266262, -0.24815025925636, 0.27046471834183, -0.26330927014351, 0.22849449515343, -0.17508020997047, 678.51788330078, 55.0, 7.0, -0.17030249536037, 0.22304573655128, -0.25979697704315, 0.27142938971519, -0.25486502051353, 0.21421203017235, -0.15936551988125, 698.40002441406, 57.0, 6.0, -0.19150678813457, 0.238320723176, -0.26654037833214, 0.26942610740662, -0.24618110060692, 0.20226114988327, 718.86468505859, 58.0, 7.0, 0.15590098500252, -0.20791395008564, 0.24886928498745, -0.26991057395935, 0.26621255278587, -0.23852504789829, 0.19297510385513, 739.92901611328, 60.0, 7.0, 0.1715562492609, -0.22014877200127, 0.25585776567459, -0.27124816179276, 0.26293614506721, -0.23262804746628, 0.18664433062077, 761.61059570312, 62.0, 7.0, 0.18354581296444, -0.22881792485714, 0.26024341583252, -0.27155277132988, 0.26036098599434, -0.22887110710144, 0.18328048288822, 783.92749023438, 64.0, 7.0, 0.19230623543262, -0.23460817337036, 0.26277205348015, -0.27145177125931, 0.2588996887207, -0.22745978832245, 0.18296651542187, 806.89831542969, 65.0, 8.0, -0.15081787109375, 0.19794663786888, -0.23791773617268, 0.26395496726036, -0.27136805653572, 0.25873649120331, -0.22829173505306, 0.1853750795126, 830.54223632812, 67.0, 8.0, -0.15522588789463, 0.20076374709606, -0.23910741508007, 0.26408475637436, -0.27143421769142, 0.25982415676117, -0.23119162023067, 0.1902981698513, 854.87896728516, 69.0, 9.0, -0.15702812373638, 0.20116400718689, -0.23845265805721, 0.26323363184929, -0.27152547240257, 0.26192283630371, -0.23593065142632, 0.19764089584351, -0.15283328294754, 879.92883300781, 71.0, 9.0, -0.15611492097378, 0.19911947846413, -0.23594242334366, 0.2613288462162, -0.27144366502762, 0.26468509435654, -0.24203997850418, 0.20688784122467, -0.16429848968983, 905.71276855469, 73.0, 9.0, -0.15262128412724, 0.1947026103735, -0.23151849210262, 0.2581450343132, -0.2708055973053, 0.26762413978577, -0.24901448190212, 0.21760985255241, -0.17774547636509, 932.25213623047, 76.0, 9.0, 0.18792995810509, -0.22503361105919, 0.25335025787354, -0.26911556720734, 0.27014023065567, -0.25623589754105, 0.22926312685013, -0.19278709590435, 0.15141631662846, 959.56921386719, 78.0, 9.0, 0.17906132340431, -0.21647197008133, 0.24662688374519, -0.26579323410988, 0.27148786187172, -0.26292860507965, 0.241185516119, -0.20899736881256, 0.17029011249542, 987.68676757812, 80.0, 10.0, 0.16791205108166, -0.20555694401264, 0.23757763206959, -0.26029509305954, 0.27096492052078, -0.26824364066124, 0.25242590904236, -0.22540324926376, 0.19035002589226, -0.15119867026806, 1016.6281738281, 82.0, 10.0, 0.15488985180855, -0.19243220984936, 0.22602604329586, -0.25211855769157, 0.26779007911682, -0.2712150812149, 0.26196053624153, -0.24106323719025, 0.21086996793747, -0.17466928064823, 1046.4176025391, 85.0, 10.0, -0.1769326031208, 0.21168777346611, -0.24082028865814, 0.26132133603096, -0.27097591757774, 0.26869943737984, -0.25470864772797, 0.2304952442646, -0.19860514998436, 0.16226254403591, 1077.080078125, 87.0, 11.0, -0.15954302251339, 0.19476439058781, -0.22625644505024, 0.25104650855064, -0.26666775345802, 0.27150574326515, -0.26503247022629, 0.24788776040077, -0.22179256379604, 0.18930837512016, -0.15348236262798, 1108.6408691406, 90.0, 10.0, 0.17494957149029, -0.20808854699135, 0.23653462529182, -0.25768136978149, 0.26950123906136, -0.27081948518753, 0.2614780664444, -0.24236232042313, 0.21528524160385, -0.18274699151516, 1141.1265869141, 92.0, 11.0, 0.15355798602104, -0.18716955184937, 0.21807223558426, -0.2437037229538, 0.26181745529175, -0.27076157927513, 0.26969081163406, -0.25867867469788, 0.23871228098869, -0.21156986057758, 0.17959892749786, 1174.5640869141, 95.0, 11.0, -0.16367842257023, 0.19584323465824, -0.22478912770748, 0.2482144087553, -0.26416185498238, 0.27125000953674, -0.26884135603905, 0.25712287425995, -0.2370870411396, 0.21041534841061, -0.17928032577038, 1208.9814453125, 98.0, 11.0, 0.17047323286533, -0.20132893323898, 0.22874251008034, -0.2506320476532, 0.26525709033012, -0.2714142203331, 0.26857629418373, -0.25695586204529, 0.23748400807381, -0.21170693635941, 0.18161359429359, 1244.4073486328, 101.0, 12.0, -0.17449237406254, 0.20419330894947, -0.23044611513615, 0.25136119127274, -0.26536619663239, 0.27137294411659, -0.26889628171921, 0.25810915231705, -0.23982687294483, 0.21542146801949, -0.18667751550674, 0.15560682117939, 1280.8712158203, 104.0, 12.0, 0.17557470500469, -0.20440621674061, 0.22996692359447, -0.25051647424698, 0.26459449529648, -0.27116721868515, 0.26973438262939, -0.26038268208504, 0.24377951025963, -0.221107006073, 0.19394415616989, -0.16411125659943, 1318.4036865234, 107.0, 12.0, -0.1742367297411, 0.20237711071968, -0.22755745053291, 0.24816669523716, -0.26282840967178, 0.27053099870682, -0.27072581648827, 0.26338210701942, -0.24899227917194, 0.22852627933025, -0.20334033668041, 0.17505016922951, 1357.0357666016, 110.0, 13.0, 0.17023415863514, -0.19790007174015, 0.22303241491318, -0.2441223859787, 0.25984635949135, -0.26918369531631, 0.27151021361351, -0.26665669679642, 0.2549264729023, -0.23706945776939, 0.21421535313129, -0.18777324259281, 0.15930798649788, 1396.8000488281, 113.0, 13.0, -0.1644671857357, 0.19162254035473, -0.21673169732094, 0.23839767277241, -0.2553583085537, 0.2665907740593, -0.27139854431152, 0.26947215199471, -0.26091724634171, 0.2462469637394, -0.22633944451809, 0.20236413180828, -0.17568483948708, 1437.7293701172, 116.0, 14.0, 0.15581920742989, -0.18258452415466, 0.20787650346756, -0.23038816452026, 0.24889636039734, -0.26235663890839, 0.26998654007912, -0.27132979035378, 0.26629459857941, -0.25516250729561, 0.23856694996357, -0.21744288504124, 0.19295294582844, -0.16639636456966, 1479.8580322266, 120.0, 14.0, 0.17148189246655, -0.19684413075447, 0.22012859582901, -0.24016471207142, 0.25590178370476, -0.26648741960526, 0.27133259177208, -0.2701578438282, 0.26301595568657, -0.25028908252716, 0.23266059160233, -0.21106369793415, 0.1866118311882, -0.16051678359509, 1523.2211914062, 123.0, 15.0, -0.15847145020962, 0.18367876112461, -0.20752508938313, 0.22891131043434, -0.2468037456274, 0.26030540466309, -0.26871979236603, 0.27160146832466, -0.26878923177719, 0.26041895151138, -0.24691458046436, 0.22895850241184, -0.2074431926012, 0.18340854346752, -0.15797005593777, 1567.8549804688, 127.0, 15.0, -0.16808906197548, 0.19224448502064, -0.21474935114384, 0.23460479080677, -0.25089114904404, 0.26282861828804, -0.26983004808426, 0.27154168486595, -0.26786825060844, 0.25898060202599, -0.24530477821827, 0.22749364376068, -0.20638327300549, 0.18293736875057, -0.15818428993225, 1613.7966308594, 130.0, 16.0, 0.15072394907475, -0.17473796010017, 0.19789415597916, -0.21925973892212, 0.2379294782877, -0.25308072566986, 0.26402509212494, -0.27025243639946, 0.27146464586258, -0.26759546995163, 0.25881585478783, -0.24552349746227, 0.22831781208515, -0.20796211063862, 0.18533559143543, -0.16137909889221, 1661.0844726562, 134.0, 16.0, 0.15539601445198, -0.17861905694008, 0.20088830590248, -0.22135190665722, 0.23918925225735, -0.25365814566612, 0.26413869857788, -0.27017080783844, 0.2714826464653, -0.26800790429115, 0.25989055633545, -0.24747663736343, 0.23129393160343, -0.21202039718628, 0.19044409692287, -0.16741727292538, 1709.7579345703, 138.0, 17.0, 0.15693308413029, -0.17948460578918, 0.20110628008842, -0.22101485729218, 0.23845525085926, -0.25274154543877, 0.26329550147057, -0.26967942714691, 0.27162200212479, -0.26903426647186, 0.26201558113098, -0.25084847211838, 0.23598270118237, -0.21801015734673, 0.19763150811195, -0.17561730742455, 0.15276618301868, 1759.8576660156, 142.0, 17.0, 0.15601663291454, -0.17794997990131, 0.19905678927898, -0.21861873567104, 0.23593893647194, -0.2503776550293, 0.26138585805893, -0.26853486895561, 0.271539747715, -0.27027547359467, 0.26478406786919, -0.25527310371399, 0.24210458993912, -0.22577601671219, 0.20689377188683, -0.1861412525177, 0.16424350440502, 1811.4255371094, 146.0, 18.0, 0.15280994772911, -0.17415936291218, 0.19484567642212, -0.21421264111996, 0.23161685466766, -0.24645836651325, 0.25821027159691, -0.26644515991211, 0.27085700631142, -0.27127724885941, 0.26768389344215, -0.26020288467407, 0.24910238385201, -0.23477910459042, 0.2177386879921, -0.19857040047646, 0.17791818082333, -0.15644954144955, 1864.5042724609, 151.0, 18.0, -0.16769739985466, 0.1880886554718, -0.20744036138058, 0.22515320777893, -0.24065683782101, 0.25343614816666, -0.26305565237999, 0.26918029785156, -0.27159211039543, 0.2702009677887, -0.26504942774773, 0.25631105899811, -0.24428227543831, 0.22936843335629, -0.21206459403038, 0.19293223321438, -0.17257325351238, 0.1516026109457, 1919.1384277344, 155.0, 19.0, -0.15917719900608, 0.17923128604889, -0.19855497777462, 0.21659535169601, -0.23281411826611, 0.24671064317226, -0.25784397125244, 0.26585265994072, -0.2704713344574, 0.27154311537743, -0.26902705430984, 0.26300036907196, -0.2536553144455, 0.24129058420658, -0.22629801928997, 0.20914517343044, -0.19035458564758, 0.17048101127148, -0.15008775889874, 1975.3735351562, 160.0, 19.0, 0.16780981421471, -0.18710418045521, 0.20549973845482, -0.22248838841915, 0.23758269846439, -0.25033593177795, 0.26036089658737, -0.26734656095505, 0.27107167243958, -0.27141460776329, 0.26835912466049, -0.26199516654015, 0.25251537561417, -0.24020700156689, 0.2254397124052, -0.208649918437, 0.19032250344753, -0.17097072303295, 0.15111543238163, 2033.2563476562, 164.0, 20.0, 0.15509508550167, -0.17410977184772, 0.1926004588604, -0.21010214090347, 0.22615568339825, -0.24032510817051, 0.25221461057663, -0.26148423552513, 0.26786354184151, -0.27116283774376, 0.27128109335899, -0.26821026206017, 0.26203587651253, -0.25293383002281, 0.24116338789463, -0.22705684602261, 0.21100635826588, -0.19344845414162, 0.17484709620476, -0.15567590296268, 2092.8352050781, 169.0, 20.0, -0.15870413184166, 0.17712239921093, -0.19497627019882, 0.21183894574642, -0.22729088366032, 0.24093478918076, -0.25241023302078, 0.26140716671944, -0.26767775416374, 0.27104598283768, -0.27141469717026, 0.26876947283745, -0.26317942142487, 0.25479474663734, -0.24384112656116, 0.23061119019985, -0.21545359492302, 0.19876000285149, -0.18095061182976, 0.16245894134045, 2154.16015625, 174.0, 21.0, 0.15975549817085, -0.17761965095997, 0.19493979215622, -0.21132571995258, 0.22639368474483, -0.23977933824062, 0.25115036964417, -0.26021817326546, 0.26674821972847, -0.27056863903999, 0.27157655358315, -0.26974201202393, 0.26510924100876, -0.25779515504837, 0.2479854375124, -0.23592774569988, 0.22192315757275, -0.20631541311741, 0.18947896361351, -0.17180609703064, 0.15369372069836, 2217.2817382812, 179.0, 21.0, -0.15773399174213, 0.17515072226524, -0.19210664927959, 0.20824237167835, -0.22320219874382, 0.23664544522762, -0.2482575327158, 0.25776040554047, -0.26492214202881, 0.2695646584034, -0.27157026529312, 0.27088564634323, -0.2675239443779, 0.26156449317932, -0.25315028429031, 0.24248303472996, -0.22981661558151, 0.21544845402241, -0.19970965385437, 0.18295408785343, -0.16554695367813, 2282.2531738281, 184.0, 22.0, 0.15342588722706, -0.17042322456837, 0.18707804381847, -0.20306062698364, 0.21804146468639, -0.23170115053654, 0.24374008178711, -0.25388789176941, 0.26191204786301, -0.26762536168098, 0.27089223265648, -0.27163311839104, 0.26982721686363, -0.2655134499073, 0.25878915190697, -0.24980719387531, 0.23877102136612, -0.22592826187611, 0.21156284213066, -0.19598609209061, 0.17952707409859, -0.16252255439758, 2349.1281738281, 190.0, 22.0, 0.16355161368847, -0.179901689291, 0.19575349986553, -0.21080414950848, 0.2247556746006, -0.23732341825962, 0.24824440479279, -0.25728520750999, 0.26424890756607, -0.26898124814034, 0.271375477314, -0.27137556672096, 0.26897832751274, -0.26423341035843, 0.25724202394485, -0.24815391004086, 0.23716285824776, -0.22450095415115, 0.21043157577515, -0.19524171948433, 0.17923347651958, -0.1627154648304, 2417.962890625, 195.0, 23.0, -0.15468706190586, 0.17069990932941, -0.18640226125717, 0.20151816308498, -0.21577169001102, 0.22889411449432, -0.24063123762608, 0.25075042247772, -0.25904712080956, 0.26535075902939, -0.26952967047691, 0.27149498462677, -0.27120319008827, 0.26865771412849, -0.26390868425369, 0.25705173611641, -0.24822533130646, 0.23760674893856, -0.22540718317032, 0.21186579763889, -0.19724301993847, 0.18181344866753, -0.16585832834244, 2488.8146972656, 201.0, 24.0, -0.15883971750736, 0.17437310516834, -0.18955446779728, 0.20412872731686, -0.21784201264381, 0.2304479777813, -0.24171426892281, 0.25142854452133, -0.2594042122364, 0.26548546552658, -0.26955166459084, 0.27152061462402, -0.27135095000267, 0.26904335618019, -0.26464065909386, 0.25822678208351, -0.24992440640926, 0.23989179730415, -0.22831857204437, 0.21542057394981, -0.20143422484398, 0.18661028146744, -0.17120738327503, 0.15548548102379, 2561.7424316406, 207.0, 24.0, -0.16037236154079, 0.17545682191849, -0.19019262492657, 0.20434506237507, -0.21768072247505, 0.22997298836708, -0.24100759625435, 0.25058802962303, -0.25854036211967, 0.26471787691116, -0.26900482177734, 0.27131941914558, -0.27161619067192, 0.26988711953163, -0.26616197824478, 0.26050758361816, -0.25302630662918, 0.24385324120522, -0.2331530302763, 0.22111548483372, -0.20795100927353, 0.19388520717621, -0.17915338277817, 0.1639948785305, 2636.8073730469, 213.0, 25.0, -0.15944331884384, 0.174112662673, -0.18847280740738, 0.20230878889561, -0.21540619432926, 0.22755594551563, -0.23855912685394, 0.24823161959648, -0.25640851259232, 0.26294803619385, -0.26773512363434, 0.27068415284157, -0.27174127101898, 0.27088558673859, -0.26812991499901, 0.26352047920227, -0.25713577866554, 0.24908484518528, -0.23950459063053, 0.22855649888515, -0.21642285585403, 0.20330236852169, -0.18940554559231, 0.17494983971119, -0.16015468537807, 2714.0715332031, 219.0, 26.0, -0.15621392428875, 0.17048977315426, -0.18452332913876, 0.19811882078648, -0.21107982099056, 0.22321335971355, -0.23433405160904, 0.24426819384098, -0.25285762548447, 0.25996321439743, -0.2654681801796, 0.26928073167801, -0.27133622765541, 0.271598726511, -0.27006188035011, 0.26674911379814, -0.26171323657036, 0.25503516197205, -0.24682214856148, 0.23720543086529, -0.22633716464043, 0.21438716351986, -0.20153899490833, 0.18798600137234, -0.17392714321613, 0.15956266224384, 2793.6000976562, 225.0, 27.0, -0.15085285902023, 0.16473561525345, -0.17846205830574, 0.19185526669025, -0.20473620295525, 0.21692728996277, -0.22825594246387, 0.23855800926685, -0.24768123030663, 0.25548842549324, -0.26186043024063, 0.26669853925705, -0.26992693543434, 0.27149403095245, -0.27137392759323, 0.26956677436829, -0.26609900593758, 0.26102274656296, -0.25441461801529, 0.24637438356876, -0.23702254891396, 0.22649803757668, -0.21495516598225, 0.20256046950817, -0.1894892603159, 0.17592203617096, -0.16204090416431, 2875.4587402344, 232.0, 28.0, 0.15611328184605, -0.16957448422909, 0.18283100426197, -0.19571913778782, 0.20807427167892, -0.21973395347595, 0.23054093122482, -0.24034625291824, 0.24901217222214, -0.25641486048698, 0.26244702935219, -0.26701989769936, 0.27006533741951, -0.2715370953083, 0.27141174674034, -0.26968950033188, 0.26639387011528, -0.26157155632973, 0.25529131293297, -0.24764277040958, 0.23873443901539, -0.22869171202183, 0.21765431761742, -0.20577353239059, 0.19320926070213, -0.18012692034245, 0.16669428348541, -0.15307833254337, 2959.7160644531, 239.0, 28.0, -0.15869300067425, 0.17175859212875, -0.18460607528687, 0.19708459079266, -0.20904284715652, 0.22033177316189, -0.2308072000742, 0.24033249914646, -0.24878112971783, 0.25603902339935, -0.26200675964355, 0.26660153269768, -0.26975867152214, 0.27143305540085, -0.27159994840622, 0.27025550603867, -0.26741695404053, 0.26312217116356, -0.25742915272713, 0.25041478872299, -0.24217350780964, 0.23281538486481, -0.22246417403221, 0.21125492453575, -0.19933149218559, 0.18684390187263, -0.17394559085369, 0.16079066693783, 3046.4423828125, 246.0, 29.0, 0.15877856314182, -0.17145934700966, 0.18393760919571, -0.19607554376125, 0.20773485302925, -0.21877899765968, 0.22907550632954, -0.23849830031395, 0.24692982435226, -0.25426316261292, 0.26040405035019, -0.26527237892151, 0.26880389451981, -0.27095127105713, 0.27168503403664, -0.27099406719208, 0.26888602972031, -0.26538702845573, 0.26054134964943, -0.25441056489944, 0.24707253277302, -0.23861992359161, 0.22915868461132, -0.21880605816841, 0.20768857002258, -0.19593980908394, 0.18369816243649, -0.1711043715477, 0.1582992374897, 3135.7099609375, 253.0, 30.0, -0.15553459525108, 0.16792725026608, -0.1801665276289, 0.19212509691715, -0.2036744505167, 0.21468691527843, -0.22503770887852, 0.23460693657398, -0.24328163266182, 0.25095760822296, -0.25754129886627, 0.26295131444931, -0.26711988449097, 0.26999408006668, -0.27153670787811, 0.27172708511353, -0.27056133747101, 0.26805251836777, -0.26423048973083, 0.25914132595062, -0.25284659862518, 0.24542237818241, -0.23695783317089, 0.22755382955074, -0.21732115745544, 0.20637871325016, -0.19485151767731, 0.18286861479282, -0.17056103050709, 0.15805968642235, 3227.5932617188, 260.0, 31.0, 0.15105406939983, -0.16309471428394, 0.17503552138805, -0.18676143884659, 0.19815576076508, -0.20910173654556, 0.21948435902596, -0.22919207811356, 0.23811854422092, -0.24616426229477, 0.25323814153671, -0.25925904512405, 0.2641569674015, -0.26787433028221, 0.27036684751511, -0.27160429954529, 0.2715710401535, -0.27026626467705, 0.26770412921906, -0.26391339302063, 0.25893715023994, -0.25283196568489, 0.2456671744585, -0.2375236004591, 0.22849234938622, -0.2186733931303, 0.20817393064499, -0.19710677862167, 0.18558859825134, -0.17373807728291, 0.16167421638966, 3322.1689453125, 268.0, 32.0, 0.15520840883255, -0.16690589487553, 0.17847566306591, -0.18981100618839, 0.20080406963825, -0.2113473713398, 0.22133532166481, -0.23066578805447, 0.23924149572849, -0.24697159230709, 0.25377291440964, -0.25957131385803, 0.26430284976959, -0.2679146528244, 0.27036586403847, -0.27162826061249, 0.27168676257133, -0.27053955197334, 0.26819825172424, -0.26468771696091, 0.26004573702812, -0.25432235002518, 0.24757917225361, -0.23988845944405, 0.23133198916912, -0.22199986875057, 0.21198916435242, -0.20140244066715, 0.19034630060196, -0.17892979085445, 0.16726285219193, -0.15545478463173, 3419.5158691406, 276.0, 33.0, 0.15674598515034, -0.16811056435108, 0.17934465408325, -0.19034993648529, 0.20102719962597, -0.21127764880657, 0.22100414335728, -0.23011261224747, 0.23851333558559, -0.24612218141556, 0.25286185741425, -0.25866293907166, 0.26346498727798, -0.2672173678875, 0.26988005638123, -0.27142414450645, 0.27183246612549, -0.27109962701797, 0.26923230290413, -0.2662490606308, 0.26218017935753, -0.25706711411476, 0.25096201896667, -0.24392692744732, 0.23603288829327, -0.22735898196697, 0.2179911583662, -0.20802102982998, 0.19754458963871, -0.18666091561317, 0.1754707545042, -0.16407519578934, 0.15257436037064, 3519.7153320312, 284.0, 34.0, 0.15582169592381, -0.16686800122261, 0.17780125141144, -0.18853156268597, 0.19896806776524, -0.20902000367641, 0.21859796345234, -0.22761492431164, 0.23598748445511, -0.243636906147, 0.25049015879631, -0.25648102164268, 0.26155078411102, -0.26564931869507, 0.26873555779457, -0.2707781791687, 0.27175608277321, -0.27165859937668, 0.27048575878143, -0.26824826002121, 0.26496729254723, -0.26067435741425, 0.25541079044342, -0.249227181077, 0.24218274652958, -0.23434449732304, 0.22578635811806, -0.21658818423748, 0.20683462917805, -0.19661413133144, 0.18601769208908, -0.17513771355152, 0.16406683623791, -0.15289676189423, 3622.8510742188, 292.0, 35.0, 0.15259876847267, -0.16333416104317, 0.1739894002676, -0.18448287248611, 0.19473181664944, -0.20465315878391, 0.21416465938091, -0.22318571805954, 0.23163847625256, -0.2394487708807, 0.24654699862003, -0.25286906957626, 0.25835716724396, -0.26296055316925, 0.26663622260094, -0.26934942603111, 0.27107414603233, -0.27179351449013, 0.27149996161461, -0.27019539475441, 0.26789110898972, -0.26460775732994, 0.26037505269051, -0.25523129105568, 0.24922302365303, -0.24240443110466, 0.23483654856682, -0.22658658027649, 0.21772699058056, -0.20833468437195, 0.19848996400833, -0.18827557563782, 0.17777568101883, -0.16707491874695, 0.15625731647015, 3729.0085449219, 301.0, 36.0, -0.15766999125481, 0.16805122792721, -0.17832247912884, 0.18840889632702, -0.1982349306345, 0.2077251970768, -0.21680526435375, 0.22540253400803, -0.23344704508781, 0.24087232351303, -0.24761609733105, 0.25362116098404, -0.25883591175079, 0.26321512460709, -0.26672038435936, 0.26932066679001, -0.27099257707596, 0.27172085642815, -0.27149838209152, 0.27032643556595, -0.26821446418762, 0.26518031954765, -0.26124969124794, 0.25645604729652, -0.25084015727043, 0.24444957077503, -0.23733814060688, 0.22956529259682, -0.22119535505772, 0.21229685842991, -0.20294161140919, 0.19320398569107, -0.18316002190113, 0.17288655042648, -0.16246032714844, 0.15195724368095, 3838.2768554688, 310.0, 36.0, 0.15896302461624, -0.16906043887138, 0.17904834449291, -0.18885751068592, 0.19841812551022, -0.20766048133373, 0.21651573479176, -0.22491663694382, 0.23279823362827, -0.24009865522385, 0.24675977230072, -0.25272783637047, 0.25795412063599, -0.26239550113678, 0.2660149037838, -0.26878181099892, 0.27067252993584, -0.27167057991028, 0.27176687121391, -0.27095979452133, 0.26925519108772, -0.26666650176048, 0.26321437954903, -0.25892660021782, 0.25383776426315, -0.24798882007599, 0.24142664670944, -0.2342035472393, 0.22637663781643, -0.21800717711449, 0.20915992558002, -0.1999024450779, 0.19030426442623, -0.18043623864651, 0.17036969959736, -0.16017575562, 3950.7470703125, 319.0, 38.0, -0.15777993202209, 0.16762857139111, -0.17738328874111, 0.18698015809059, -0.19635455310345, 0.20544186234474, -0.21417807042599, 0.22250047326088, -0.23034824430943, 0.23766316473484, -0.24439014494419, 0.25047791004181, -0.25587949156761, 0.26055273413658, -0.26446086168289, 0.26757276058197, -0.26986339688301, 0.27131408452988, -0.27191272377968, 0.27165386080742, -0.27053889632225, 0.26857599616051, -0.26577997207642, 0.26217222213745, -0.25778043270111, 0.25263828039169, -0.24678514897823, 0.2402655929327, -0.23312894999981, 0.22542877495289, -0.2172222584486, 0.20856964588165, -0.19953356683254, 0.19017842411995, -0.18056970834732, 0.17077331244946, -0.1608549207449, 0.15087930858135, 4066.5126953125, 328.0, 39.0, 0.15549972653389, -0.16502882540226, 0.17448374629021, -0.18380717933178, 0.19294111430645, -0.20182737708092, 0.21040815114975, -0.21862652897835, 0.22642707824707, -0.23375633358955, 0.24056336283684, -0.24680024385452, 0.25242257118225, -0.25738987326622, 0.26166605949402, -0.26521971821785, 0.26802459359169, -0.27005967497826, 0.27130952477455, -0.27176442742348, 0.27142056822777, -0.27027985453606, 0.26835018396378, -0.26564520597458, 0.26218417286873, -0.25799188017845, 0.25309824943542, -0.24753820896149, 0.24135120213032, -0.23458082973957, 0.227274492383, -0.21948277950287, 0.21125911176205, -0.20265913009644, 0.19374015927315, -0.18456073105335, 0.17517989873886, -0.16565681993961, 0.15605008602142, 4185.6704101562, 338.0, 40.0, 0.1591269671917, -0.1683551222086, 0.17749464511871, -0.18649286031723, 0.19529661536217, -0.20385277271271, 0.21210859715939, -0.22001230716705, 0.22751346230507, -0.23456348478794, 0.24111610651016, -0.2471277564764, 0.25255799293518, -0.25736996531487, 0.26153057813644, -0.26501107215881, 0.26778706908226, -0.26983892917633, 0.27115195989609, -0.27171650528908, 0.27152809500694, -0.27058747410774, 0.26890054345131, -0.26647847890854, 0.26333743333817, -0.25949850678444, 0.25498747825623, -0.24983471632004, 0.24407464265823, -0.23774564266205, 0.23088954389095, -0.22355133295059, 0.21577866375446, -0.20762148499489, 0.19913148880005, -0.19036172330379, 0.18136608600616, -0.17219880223274, 0.16291399300098, -0.15356522798538, 4308.3203125, 347.0, 42.0, -0.15117271244526, 0.1601740270853, -0.16913482546806, 0.17800752818584, -0.18674379587173, 0.19529490172863, -0.20361207425594, 0.21164701879025, -0.21935220062733, 0.22668132185936, -0.23358969390392, 0.24003466963768, -0.24597591161728, 0.25137591362, -0.2562001645565, 0.26041758060455, -0.26400077342987, 0.26692619919777, -0.26917457580566, 0.27073082327843, -0.27158439159393, 0.27172929048538, -0.27116411924362, 0.26989218592644, -0.26792132854462, 0.26526400446892, -0.26193711161613, 0.25796177983284, -0.25336334109306, 0.24817088246346, -0.24241723120213, 0.23613847792149, -0.22937375307083, 0.22216482460499, -0.21455577015877, 0.20659258961678, -0.19832277297974, 0.18979494273663, -0.18105839192867, 0.17216268181801, -0.1631572842598, 0.15409107506275, 4434.5634765625, 358.0, 42.0, 0.15749473869801, -0.16626146435738, 0.17496074736118, -0.18354769051075, 0.19197691977024, -0.20020286738873, 0.20818020403385, -0.21586410701275, 0.22321075201035, -0.23017755150795, 0.2367235571146, -0.2428098320961, 0.24839973449707, -0.25345927476883, 0.25795736908913, -0.26186609268188, 0.26516106724739, -0.26782143115997, 0.26983028650284, -0.2711746096611, 0.27184560894966, -0.27183857560158, 0.27115315198898, -0.2697930932045, 0.26776653528214, -0.26508560776711, 0.26176664233208, -0.25782975554466, 0.25329887866974, -0.24820145964622, 0.24256829917431, -0.23643317818642, 0.22983266413212, -0.22280576825142, 0.21539363265038, -0.2076391428709, 0.19958664476871, -0.19128149747849, 0.18276976048946, -0.17409780621529, 0.16531194746494, -0.15645805001259, 4564.5063476562, 368.0, 44.0, 0.1538969129324, -0.16239319741726, 0.17084388434887, -0.17920865118504, 0.18744663894176, -0.19551666080952, 0.20337757468224, -0.21098852157593, 0.21830928325653, -0.22530056536198, 0.23192429542542, -0.23814392089844, 0.24392475187778, -0.24923411011696, 0.2540417611599, -0.25831997394562, 0.26204389333725, -0.26519170403481, 0.26774477958679, -0.26968783140182, 0.27100911736488, -0.27170041203499, 0.2717572748661, -0.27117884159088, 0.26996803283691, -0.26813152432442, 0.26567947864532, -0.26262584328651, 0.258987814188, -0.25478610396385, 0.250044465065, -0.24478965997696, 0.23905122280121, -0.23286120593548, 0.22625395655632, -0.21926578879356, 0.21193477511406, -0.20430037379265, 0.19640319049358, -0.18828462064266, 0.17998656630516, -0.17155106365681, 0.16302007436752, -0.15443505346775, 4698.2563476562, 379.0, 45.0, -0.15501521527767, 0.16329617798328, -0.17153109610081, 0.17968247830868, -0.18771234154701, 0.19558243453503, -0.2032545208931, 0.21069060266018, -0.21785323321819, 0.22470581531525, -0.23121279478073, 0.23733997344971, -0.24305479228497, 0.24832651019096, -0.25312647223473, 0.25742837786674, -0.26120838522911, 0.26444539427757, -0.26712110638618, 0.26922035217285, -0.27073097229004, 0.27164414525032, -0.27195429801941, 0.27165925502777, -0.27076011896133, 0.26926153898239, -0.26717132329941, 0.26450070738792, -0.26126405596733, 0.25747886300087, -0.25316554307938, 0.24834737181664, -0.24305020272732, 0.23730239272118, -0.23113445937634, 0.22457894682884, -0.21767012774944, 0.21044377982616, -0.20293690264225, 0.1951874345541, -0.18723401427269, 0.17911566793919, -0.17087149620056, 0.16254051029682, -0.15416124463081, 4835.92578125, 390.0, 47.0, 0.15516655147076, -0.16318091750145, 0.17115105688572, -0.17904305458069, 0.18682259321213, -0.19445513188839, 0.20190608501434, -0.2091411203146, 0.21612638235092, -0.22282868623734, 0.22921571135521, -0.23525635898113, 0.24092079699039, -0.24618081748486, 0.25100994110107, -0.2553836107254, 0.25927948951721, -0.26267743110657, 0.26555976271629, -0.26791137456894, 0.26971986889839, -0.27097553014755, 0.27167159318924, -0.2718041241169, 0.27137207984924, -0.27037745714188, 0.26882511377335, -0.26672276854515, 0.26408106088638, -0.26091334223747, 0.25723564624786, -0.25306656956673, 0.24842712283134, -0.24334061145782, 0.237832441926, -0.23192995786667, 0.22566223144531, -0.21905986964703, 0.21215483546257, -0.20498017966747, 0.19756978750229, -0.18995822966099, 0.18218047916889, -0.17427168786526, 0.1662669479847, -0.15820103883743, 0.1501082777977, 4977.6293945312, 401.0, 48.0, -0.15152448415756, 0.15933136641979, -0.16711211204529, 0.17483577132225, -0.18247087299824, 0.18998564779758, -0.19734819233418, 0.2045266777277, -0.21148958802223, 0.21820585429668, -0.22464506328106, 0.23077772557735, -0.23657539486885, 0.24201087653637, -0.24705842137337, 0.25169390439987, -0.25589495897293, 0.25964114069939, -0.26291412115097, 0.26569771766663, -0.26797810196877, 0.26974377036095, -0.27098581194878, 0.27169781923294, -0.27187597751617, 0.2715191245079, -0.2706286907196, 0.26920881867409, -0.26726615428925, 0.26480999588966, -0.26185208559036, 0.25840666890144, -0.25449016690254, 0.25012138485909, -0.2453211247921, 0.24011215567589, -0.23451904952526, 0.22856801748276, -0.22228670120239, 0.21570408344269, -0.20885016024113, 0.20175585150719, -0.19445277750492, 0.18697300553322, -0.17934890091419, 0.17161291837692, -0.16379737854004, 0.1559342443943, 5123.4848632812, 413.0, 49.0, -0.15329107642174, 0.16087834537029, -0.16843540966511, 0.17593371868134, -0.18334428966045, 0.19063787162304, -0.19778515398502, 0.20475685596466, -0.21152400970459, 0.2180580496788, -0.2243310213089, 0.23031571507454, -0.23598593473434, 0.24131651222706, -0.24628362059593, 0.25086480379105, -0.25503921508789, 0.25878763198853, -0.26209273934364, 0.26493912935257, -0.26731342077255, 0.26920434832573, -0.27060291171074, 0.27150228619576, -0.27189806103706, 0.27178806066513, -0.27117255330086, 0.27005413174629, -0.26843774318695, 0.26633062958717, -0.2637422978878, 0.26068452000618, -0.25717118382454, 0.25321814417839, -0.24884329736233, 0.24406635761261, -0.23890870809555, 0.23339334130287, -0.22754466533661, 0.22138833999634, -0.21495115756989, 0.20826086401939, -0.20134596526623, 0.1942355632782, -0.18695919215679, 0.17954660952091, -0.17202767729759, 0.16443207859993, -0.15678928792477, 5273.6147460938, 425.0, 51.0, -0.15259397029877, 0.15996535122395, -0.16731148958206, 0.17460624873638, -0.18182314932346, 0.18893539905548, -0.1959161311388, 0.20273850858212, -0.20937587320805, 0.21580192446709, -0.22199079394341, 0.22791734337807, -0.23355711996555, 0.23888668417931, -0.24388360977173, 0.2485267072916, -0.25279608368874, 0.25667333602905, -0.26014158129692, 0.26318565011024, -0.26579210162163, 0.26794937252998, -0.26964777708054, 0.27087965607643, -0.27163931727409, 0.27192318439484, -0.27172979712486, 0.27105969190598, -0.26991564035416, 0.26830235123634, -0.26622673869133, 0.26369759440422, -0.26072579622269, 0.25732403993607, -0.25350686907768, 0.24929058551788, -0.24469308555126, 0.2397338449955, -0.23443372547626, 0.22881487011909, -0.2229005843401, 0.21671523153782, -0.21028400957584, 0.20363286137581, -0.19678831100464, 0.18977728486061, -0.18262702226639, 0.17536483705044, -0.16801804304123, 0.16061376035213, -0.15317875146866, 5428.1430664062, 438.0, 52.0, 0.15675254166126, -0.16389544308186, 0.17100131511688, -0.17804606258869, 0.18500533699989, -0.19185465574265, 0.19856944680214, -0.20512525737286, 0.21149782836437, -0.21766328811646, 0.22359821200371, -0.2292798012495, 0.23468597233295, -0.23979549109936, 0.24458812177181, -0.24904470145702, 0.25314727425575, -0.25687912106514, 0.26022505760193, -0.26317122578621, 0.2657054066658, -0.26781705021858, 0.26949724555016, -0.27073886990547, 0.2715365588665, -0.2718867957592, 0.27178791165352, -0.27124008536339, 0.27024540305138, -0.26880773901939, 0.26693281531334, -0.26462817192078, 0.26190310716629, -0.25876858830452, 0.25523725152016, -0.25132328271866, 0.24704237282276, -0.24241161346436, 0.23744942247868, -0.23217536509037, 0.22661013901234, -0.22077541053295, 0.21469369530678, -0.20838825404644, 0.20188294351101, -0.19520206749439, 0.18837033212185, -0.18141257762909, 0.17435379326344, -0.16721886396408, 0.16003251075745, -0.15281914174557, 5587.2001953125, 450.0, 54.0, 0.15140682458878, -0.15834441781044, 0.16526412963867, -0.1721442937851, 0.17896296083927, -0.18569792807102, 0.19232684373856, -0.19882740080357, 0.20517730712891, -0.21135452389717, 0.21733732521534, -0.22310438752174, 0.22863490879536, -0.23390875756741, 0.23890651762486, -0.24360965192318, 0.24800054728985, -0.25206261873245, 0.25578042864799, -0.25913974642754, 0.26212760806084, -0.26473242044449, 0.26694405078888, -0.26875373721123, 0.2701543867588, -0.27114033699036, 0.27170762419701, -0.27185383439064, 0.27157825231552, -0.27088171243668, 0.26976680755615, -0.26823765039444, 0.26629999279976, -0.26396119594574, 0.26123005151749, -0.25811699032784, 0.25463372468948, -0.25079345703125, 0.24661061167717, -0.24210084974766, 0.23728100955486, -0.23216895759106, 0.22678349912167, -0.22114433348179, 0.21527190506458, -0.20918728411198, 0.20291212201118, -0.19646848738194, 0.18987876176834, -0.18316550552845, 0.17635144293308, -0.16945920884609, 0.16251134872437, -0.15553013980389, 5750.9174804688, 464.0, 55.0, 0.15578000247478, -0.1625379472971, 0.16926787793636, -0.17594949901104, 0.18256224691868, -0.18908534944057, 0.19549798965454, -0.20177938044071, 0.20790879428387, -0.21386578679085, 0.21963016688824, -0.22518220543861, 0.23050263524055, -0.23557284474373, 0.2403748780489, -0.24489156901836, 0.24910667538643, -0.25300484895706, 0.25657185912132, -0.25979447364807, 0.26266077160835, -0.26515999436378, 0.26728269457817, -0.26902079582214, 0.27036762237549, -0.27131792902946, 0.27186787128448, -0.27201518416405, 0.27175906300545, -0.27110013365746, 0.27004066109657, -0.26858428120613, 0.2667361497879, -0.26450288295746, 0.26189249753952, -0.25891438126564, 0.2555792927742, -0.25189915299416, 0.24788723886013, -0.24355788528919, 0.23892651498318, -0.23400957882404, 0.22882440686226, -0.22338917851448, 0.2177227884531, -0.21184478700161, 0.20577526092529, -0.19953475892544, 0.19314417243004, -0.18662461638451, 0.17999735474586, -0.17328371107578, 0.16650491952896, -0.15968209505081, 0.15283605456352, 5919.4321289062, 477.0, 57.0, -0.15274548530579, 0.15928737819195, -0.16581116616726, 0.17229864001274, -0.17873135209084, 0.18509064614773, -0.19135777652264, 0.19751393795013, -0.20354041457176, 0.20941859483719, -0.21513010561466, 0.22065685689449, -0.22598114609718, 0.23108576238155, -0.23595398664474, 0.24056978523731, -0.2449177801609, 0.24898336827755, -0.25275278091431, 0.25621321797371, -0.25935274362564, 0.26216050982475, -0.2646267414093, 0.26674282550812, -0.26850125193596, 0.26989576220512, -0.27092128992081, 0.27157413959503, -0.27185174822807, 0.27175298333168, -0.27127796411514, 0.27042809128761, -0.26920613646507, 0.2676160633564, -0.2656632065773, 0.26335406303406, -0.26069638133049, 0.25769913196564, -0.25437235832214, 0.25072717666626, -0.24677586555481, 0.24253153800964, -0.23800830543041, 0.23322111368179, -0.22818568348885, 0.22291846573353, -0.21743653714657, 0.2117575109005, -0.205899477005, 0.19988092780113, -0.19372065365314, 0.18743766844273, -0.18105110526085, 0.17458015680313, -0.16804400086403, 0.16146165132523, -0.15485197305679, 6092.884765625, 491.0, 59.0, -0.15206424891949, 0.15846168994904, -0.16484478116035, 0.17119650542736, -0.17749962210655, 0.18373668193817, -0.18989016115665, 0.19594244658947, -0.20187595486641, 0.20767323672771, -0.2133170068264, 0.21879023313522, -0.22407618165016, 0.22915856540203, -0.23402152955532, 0.23864980041981, -0.24302868545055, 0.24714417755604, -0.25098299980164, 0.25453272461891, -0.2577817440033, 0.26071932911873, -0.26333582401276, 0.2656224668026, -0.26757162809372, 0.26917672157288, -0.27043226361275, 0.27133399248123, -0.27187868952751, 0.27206444740295, -0.27189049124718, 0.27135720849037, -0.27046620845795, 0.26922032237053, -0.267623513937, 0.26568093895912, -0.26339882612228, 0.26078459620476, -0.25784665346146, 0.25459453463554, -0.25103870034218, 0.247190579772, -0.24306246638298, 0.23866751790047, -0.23401968181133, 0.22913360595703, -0.22402456402779, 0.21870844066143, -0.21320162713528, 0.20752094686031, -0.20168356597424, 0.19570697844028, -0.18960885703564, 0.18340703845024, -0.17711938917637, 0.17076377570629, -0.16435797512531, 0.15791961550713, -0.15146605670452, 6271.419921875, 506.0, 60.0, 0.15517927706242, -0.16140328347683, 0.16760729253292, -0.17377546429634, 0.17989178001881, -0.18594007194042, 0.19190403819084, -0.19776740670204, 0.20351389050484, -0.20912736654282, 0.2145918160677, -0.21989151835442, 0.22501102089882, -0.22993522882462, 0.23464949429035, -0.23913967609406, 0.24339215457439, -0.24739395081997, 0.25113272666931, -0.25459691882133, 0.25777566432953, -0.26065894961357, 0.26323768496513, -0.26550364494324, 0.26744949817657, -0.26906898617744, 0.27035680413246, -0.27130869030952, 0.27192142605782, -0.2721928358078, 0.27212193608284, -0.27170866727829, 0.2709541618824, -0.26986059546471, 0.26843124628067, -0.26667040586472, 0.26458346843719, -0.26217675209045, 0.25945767760277, -0.25643453001976, 0.25311657786369, -0.24951396882534, 0.24563767015934, -0.24149943888187, 0.23711179196835, -0.23248793184757, 0.22764168679714, -0.22258748114109, 0.21734020113945, -0.21191523969173, 0.20632833242416, -0.20059554278851, 0.19473321735859, -0.1887578368187, 0.18268601596355, -0.1765344440937, 0.17031975090504, -0.16405849158764, 0.15776710212231, -0.1514617651701, 6455.1865234375, 520.0, 63.0, 0.15173301100731, -0.15773189067841, 0.16371937096119, -0.16968150436878, 0.17560413479805, -0.18147292733192, 0.18727345764637, -0.19299124181271, 0.19861181080341, -0.20412071049213, 0.20950363576412, -0.21474638581276, 0.21983502805233, -0.22475585341454, 0.22949548065662, -0.2340409308672, 0.23837961256504, -0.24249941110611, 0.24638873338699, -0.25003656744957, 0.253432482481, -0.25656670331955, 0.25943019986153, -0.26201462745667, 0.26431238651276, -0.26631671190262, 0.26802161335945, -0.26942205429077, 0.27051371335983, -0.27129328250885, 0.27175834774971, -0.271907299757, 0.27173957228661, -0.27125549316406, 0.27045625448227, -0.26934406161308, 0.26792192459106, -0.26619386672974, 0.26416471600533, -0.26184022426605, 0.25922691822052, -0.256332218647, 0.25316426157951, -0.24973197281361, 0.24604505300522, -0.24211378395557, 0.2379491776228, -0.23356278240681, 0.22896674275398, -0.22417367994785, 0.21919669210911, -0.21404924988747, 0.208745226264, -0.20329876244068, 0.19772423803806, -0.19203622639179, 0.18624944984913, -0.18037870526314, 0.17443878948689, -0.16844449937344, 0.16241052746773, -0.15635144710541, 0.15028159320354, 6644.337890625, 535.0, 65.0, -0.15002454817295, 0.15587761998177, -0.16172416508198, 0.16755130887032, -0.17334592342377, 0.17909477651119, -0.18478448688984, 0.19040161371231, -0.19593270123005, 0.20136432349682, -0.20668311417103, 0.21187584102154, -0.21692942082882, 0.22183099389076, -0.22656799852848, 0.23112812638283, -0.23549945652485, 0.23967047035694, -0.24363009631634, 0.24736770987511, -0.25087323784828, 0.2541372179985, -0.25715067982674, 0.25990542769432, -0.2623938024044, 0.26460888981819, -0.26654458045959, 0.26819536089897, -0.26955661177635, 0.27062445878983, -0.27139583230019, 0.27186849713326, -0.27204099297523, 0.271912753582, -0.27148398756981, 0.27075582742691, -0.26973015069962, 0.26840969920158, -0.26679801940918, 0.26489946246147, -0.26271918416023, 0.26026305556297, -0.25753772258759, 0.2545505464077, -0.25130960345268, 0.24782356619835, -0.24410180747509, 0.24015422165394, -0.23599131405354, 0.23162408173084, -0.22706396877766, 0.22232288122177, -0.21741309762001, 0.21234725415707, -0.20713824033737, 0.20179924368858, -0.19634360074997, 0.19078481197357, -0.18513649702072, 0.17941230535507, -0.17362590134144, 0.16779090464115, -0.16192081570625, 0.15602904558182, -0.1501287817955, 6839.0317382812, 551.0, 66.0, -0.15174251794815, 0.15741658210754, -0.1630816757679, 0.16872598230839, -0.17433753609657, 0.1799042224884, -0.1854138225317, 0.1908540725708, -0.19621267914772, 0.20147736370564, -0.20663593709469, 0.21167626976967, -0.21658642590046, 0.2213546037674, -0.22596926987171, 0.23041915893555, -0.23469325900078, 0.23878096044064, -0.24267199635506, 0.24635654687881, -0.24982523918152, 0.25306916236877, -0.25607994198799, 0.25884979963303, -0.26137146353722, 0.26363831758499, -0.26564434170723, 0.26738420128822, -0.26885321736336, 0.27004742622375, -0.27096351981163, 0.2715989947319, -0.27195200324059, 0.27202141284943, -0.27180695533752, 0.27130898833275, -0.27052867412567, 0.2694678902626, -0.26812922954559, 0.26651608943939, -0.2646324634552, 0.26248314976692, -0.26007354259491, 0.2574098110199, -0.25449866056442, 0.25134742259979, -0.24796409904957, 0.24435719847679, -0.24053575098515, 0.23650930821896, -0.23228789865971, 0.22788198292255, -0.22330237925053, 0.218560308218, -0.21366727352142, 0.20863509178162, -0.20347578823566, 0.19820156693459, -0.19282484054565, 0.18735808134079, -0.18181386590004, 0.17620475590229, -0.17054334282875, 0.1648421138525, -0.15911351144314, 0.15336978435516, 7039.4306640625, 567.0, 68.0, -0.15100680291653, 0.1565342694521, -0.16205479204655, 0.16755749285221, -0.17303133010864, 0.17846514284611, -0.18384765088558, 0.18916755914688, -0.19441351294518, 0.19957418739796, -0.20463828742504, 0.20959462225437, -0.21443210542202, 0.21913979947567, -0.22370700538158, 0.22812317311764, -0.23237806558609, 0.23646174371243, -0.24036456644535, 0.2440772652626, -0.24759097397327, 0.2508972287178, -0.25398805737495, 0.256855905056, -0.25949373841286, 0.26189512014389, -0.26405408978462, 0.2659652531147, -0.26762387156487, 0.26902574300766, -0.27016735076904, 0.27104580402374, -0.27165877819061, 0.27200472354889, -0.27208265662193, 0.27189230918884, -0.27143403887749, 0.27070891857147, -0.26971864700317, 0.26846560835838, -0.26695275306702, 0.26518377661705, -0.26316291093826, 0.26089510321617, -0.25838574767113, 0.25564098358154, -0.25266736745834, 0.24947206676006, -0.24606271088123, 0.24244745075703, -0.23863486945629, 0.23463398218155, -0.23045420646667, 0.22610530257225, -0.22159740328789, 0.21694089472294, -0.21214646100998, 0.20722499489784, -0.20218758285046, 0.19704547524452, -0.19181004166603, 0.18649272620678, -0.18110504746437, 0.17565849423409, -0.1701645553112, 0.16463465988636, -0.1590801179409, 0.15351213514805, 7245.7021484375, 584.0, 70.0, 0.15334123373032, -0.15868601202965, 0.16402038931847, -0.16933444142342, 0.17461816966534, -0.17986139655113, 0.18505394458771, -0.190185546875, 0.19524592161179, -0.20022481679916, 0.20511201024055, -0.20989736914635, 0.21457083523273, -0.21912252902985, 0.22354270517826, -0.22782181203365, 0.23195053637028, -0.23591981828213, 0.2397208660841, -0.24334520101547, 0.2467847019434, -0.25003159046173, 0.25307846069336, -0.25591835379601, 0.25854474306107, -0.26095151901245, 0.26313310861588, -0.26508432626724, 0.26680064201355, -0.26827794313431, 0.26951268315315, -0.27050188183784, 0.27124315500259, -0.27173456549644, 0.2719749212265, -0.27196350693703, 0.27170017361641, -0.27118545770645, 0.27042037248611, -0.26940658688545, 0.26814630627632, -0.26664233207703, 0.26489803195, -0.26291730999947, 0.26070457696915, -0.2582648396492, 0.25560358166695, -0.25272673368454, 0.2496407777071, -0.2463525980711, 0.242869541049, -0.23919932544231, 0.2353501021862, -0.23133033514023, 0.22714884579182, -0.22281476855278, 0.21833747625351, -0.21372662484646, 0.20899207890034, -0.20414389669895, 0.19919224083424, -0.19414748251438, 0.18902003765106, -0.1838203817606, 0.17855902016163, -0.17324648797512, 0.16789326071739, -0.16250975430012, 0.15710632503033, -0.15169315040112, 7458.0170898438, 601.0, 72.0, -0.15319493412971, 0.15839399397373, -0.16358345746994, 0.16875420510769, -0.17389704287052, 0.17900264263153, -0.18406163156033, 0.18906460702419, -0.1940021365881, 0.19886477291584, -0.20364315807819, 0.20832794904709, -0.21290992200375, 0.21737995743752, -0.2217290699482, 0.22594845294952, -0.23002949357033, 0.23396378755569, -0.23774316906929, 0.241359770298, -0.24480599164963, 0.24807453155518, -0.25115844607353, 0.25405114889145, -0.25674641132355, 0.25923842191696, -0.26152178645134, 0.26359149813652, -0.2654430270195, 0.26707231998444, -0.26847574114799, 0.26965022087097, -0.27059310674667, 0.27130225300789, -0.27177608013153, 0.27201345562935, -0.27201381325722, 0.27177709341049, -0.27130371332169, 0.27059465646744, -0.26965141296387, 0.26847597956657, -0.26707085967064, 0.26543906331062, -0.26358404755592, 0.26150983572006, -0.25922080874443, 0.25672188401222, -0.25401836633682, 0.25111603736877, -0.24802102148533, 0.24473989009857, -0.24127954244614, 0.23764722049236, -0.23385052382946, 0.2298973351717, -0.22579582035542, 0.22155439853668, -0.21718171238899, 0.21268662810326, -0.20807817578316, 0.20336556434631, -0.19855807721615, 0.1936651468277, -0.18869626522064, 0.18366096913815, -0.17856881022453, 0.17342934012413, -0.16825206577778, 0.16304644942284, -0.15782186388969, 0.15258756279945, 7676.5537109375, 619.0, 73.0, -0.15355108678341, 0.15864852070808, -0.1637370288372, 0.16880804300308, -0.1738528162241, 0.17886258661747, -0.18382845818996, 0.18874154984951, -0.19359293580055, 0.19837369024754, -0.20307491719723, 0.2076877951622, -0.21220354735851, 0.21661353111267, -0.22090922296047, 0.22508220374584, -0.22912429273129, 0.23302747309208, -0.2367839217186, 0.2403861284256, -0.24382676184177, 0.24709883332253, -0.25019562244415, 0.25311076641083, -0.25583824515343, 0.25837233662605, -0.26070776581764, 0.262839615345, -0.26476341485977, 0.26647508144379, -0.26797091960907, 0.26924777030945, -0.27030289173126, 0.27113398909569, -0.27173924446106, 0.27211731672287, -0.27226734161377, 0.27218893170357, -0.27188220620155, 0.27134773135185, -0.27058660984039, 0.26960036158562, -0.26839101314545, 0.26696106791496, -0.26531344652176, 0.26345157623291, -0.26137927174568, 0.25910085439682, -0.25662100315094, 0.25394481420517, -0.25107780098915, 0.24802578985691, -0.24479505419731, 0.24139213562012, -0.23782393336296, 0.23409762978554, -0.23022069036961, 0.22620083391666, -0.22204604744911, 0.21776449680328, -0.21336455643177, 0.20885476469994, -0.20424380898476, 0.19954046607018, -0.19475364685059, 0.18989232182503, -0.18496549129486, 0.17998220026493, -0.17495147883892, 0.16988232731819, -0.16478370130062, 0.15966448187828, -0.15453344583511, 7901.494140625, 637.0, 76.0, -0.15361620485783, 0.15852797031403, -0.16343170404434, 0.1683197170496, -0.17318423092365, 0.17801739275455, -0.18281126022339, 0.18755786120892, -0.1922492235899, 0.19687734544277, -0.2014342546463, 0.20591197907925, -0.21030266582966, 0.21459849178791, -0.2187917381525, 0.22287482023239, -0.22684025764465, 0.2306807488203, -0.23438918590546, 0.23795861005783, -0.24138230085373, 0.24465377628803, -0.24776676297188, 0.25071531534195, -0.25349372625351, 0.25609657168388, -0.25851881504059, 0.2607556283474, -0.26280263066292, 0.26465573906898, -0.26631125807762, 0.26776584982872, -0.26901653409004, 0.27006080746651, -0.27089646458626, 0.2715217769146, -0.27193537354469, 0.27213636040688, -0.27212423086166, 0.27189889550209, -0.27146065235138, 0.27081027626991, -0.26994895935059, 0.26887825131416, -0.26760014891624, 0.26611706614494, -0.26443180441856, 0.26254758238792, -0.26046794652939, 0.25819686055183, -0.25573864579201, 0.25309798121452, -0.25027987360954, 0.24728965759277, -0.24413298070431, 0.24081578850746, -0.23734432458878, 0.23372507095337, -0.22996479272842, 0.22607043385506, -0.22204917669296, 0.21790842711926, -0.21365569531918, 0.20929871499538, -0.20484530925751, 0.20030342042446, -0.19568109512329, 0.19098643958569, -0.18622760474682, 0.18141280114651, -0.17655020952225, 0.17164804041386, -0.16671442985535, 0.16175748407841, -0.15678524971008, 0.15180565416813, 8133.025390625, 655.0, 79.0, -0.15151995420456, 0.15628616511822, -0.16104745864868, 0.16579686105251, -0.17052735388279, 0.17523178458214, -0.17990298569202, 0.18453370034695, -0.18911670148373, 0.1936447173357, -0.19811049103737, 0.20250678062439, -0.20682641863823, 0.21106223762035, -0.21520721912384, 0.21925435960293, -0.22319681942463, 0.22702787816525, -0.23074094951153, 0.23432958126068, -0.23778752982616, 0.24110874533653, -0.24428735673428, 0.2473177164793, -0.25019443035126, 0.25291234254837, -0.25546658039093, 0.25785246491432, -0.26006573438644, 0.26210227608681, -0.26395842432976, 0.2656307220459, -0.26711609959602, 0.26841181516647, -0.26951539516449, 0.27042484283447, -0.2711383998394, 0.27165475487709, -0.27197286486626, 0.27209210395813, -0.27201223373413, 0.27173337340355, -0.27125591039658, 0.27058076858521, -0.26970908045769, 0.26864242553711, -0.2673827111721, 0.26593223214149, -0.26429355144501, 0.26246964931488, -0.26046380400658, 0.25827959179878, -0.2559210062027, 0.25339218974113, -0.25069770216942, 0.24784237146378, -0.24483121931553, 0.24166959524155, -0.23836308717728, 0.23491749167442, -0.23133882880211, 0.22763331234455, -0.22380737960339, 0.21986757218838, -0.21582064032555, 0.2116734534502, -0.20743298530579, 0.20310634374619, -0.19870069622993, 0.19422328472137, -0.18968141078949, 0.18508242070675, -0.1804336309433, 0.17574241757393, -0.17101609706879, 0.1662619560957, -0.16148725152016, 0.15669916570187, -0.15190477669239, 8371.3408203125, 675.0, 80.0, -0.15406732261181, 0.15872676670551, -0.16337856650352, 0.16801618039608, -0.17263293266296, 0.17722214758396, -0.18177704513073, 0.18629084527493, -0.19075675308704, 0.19516794383526, -0.1995176076889, 0.2037989795208, -0.20800532400608, 0.21212995052338, -0.21616627275944, 0.22010776400566, -0.22394800186157, 0.22768069803715, -0.23129968345165, 0.23479893803596, -0.23817260563374, 0.24141499400139, -0.24452064931393, 0.24748423695564, -0.25030070543289, 0.25296524167061, -0.25547316670418, 0.25782018899918, -0.26000216603279, 0.2620153427124, -0.263856112957, 0.26552125811577, -0.26700782775879, 0.26831313967705, -0.26943492889404, 0.27037110924721, -0.27112004160881, 0.27168035507202, -0.27205100655556, 0.27223125100136, -0.27222082018852, 0.27201959490776, -0.27162796258926, 0.27104651927948, -0.27027627825737, 0.2693185210228, -0.26817491650581, 0.2668474316597, -0.26533836126328, 0.26365029811859, -0.26178616285324, 0.25974917411804, -0.25754284858704, 0.25517097115517, -0.2526376247406, 0.24994714558125, -0.24710412323475, 0.2441134005785, -0.24098005890846, 0.23770938813686, -0.23430688679218, 0.230778247118, -0.22712935507298, 0.22336626052856, -0.21949514746666, 0.21552236378193, -0.21145437657833, 0.20729774236679, -0.20305912196636, 0.1987452507019, -0.19436293840408, 0.18991902470589, -0.18542039394379, 0.18087393045425, -0.17628653347492, 0.1716650724411, -0.16701638698578, 0.16234727203846, -0.15766447782516, 0.15297466516495, 8616.640625, 694.0, 84.0, 0.15211327373981, -0.15658624470234, 0.16105437278748, -0.165511906147, 0.1699530184269, -0.1743718534708, 0.17876245081425, -0.18311884999275, 0.18743506073952, -0.19170509278774, 0.19592291116714, -0.20008255541325, 0.20417803525925, -0.20820343494415, 0.21215285360813, -0.21602047979832, 0.21980056166649, -0.22348743677139, 0.22707556188107, -0.23055945336819, 0.23393379151821, -0.23719339072704, 0.24033319950104, -0.243348300457, 0.24623396992683, -0.24898567795753, 0.25159904360771, -0.25406992435455, 0.25639432668686, -0.25856852531433, 0.26058900356293, -0.26245251297951, 0.26415592432022, -0.26569652557373, 0.26707175374031, -0.26827928423882, 0.26931715011597, -0.27018359303474, 0.27087709307671, -0.2713965177536, 0.27174091339111, -0.27190965414047, 0.27190241217613, -0.27171909809113, 0.27135992050171, -0.27082544565201, 0.27011641860008, -0.26923394203186, 0.26817935705185, -0.26695430278778, 0.26556068658829, -0.2640006840229, 0.26227676868439, -0.26039162278175, 0.25834819674492, -0.25614973902702, 0.25379964709282, -0.2513016462326, 0.24865962564945, -0.24587771296501, 0.24296024441719, -0.23991174995899, 0.23673692345619, -0.23344069719315, 0.23002810776234, -0.22650438547134, 0.22287487983704, -0.21914508938789, 0.21532064676285, -0.2114072740078, 0.20741076767445, -0.20333707332611, 0.19919213652611, -0.19498199224472, 0.19071274995804, -0.18639050424099, 0.18202139437199, -0.17761155962944, 0.17316713929176, -0.16869427263737, 0.16419902443886, -0.15968745946884, 0.15516556799412, -0.15063926577568, 8869.126953125, 715.0, 85.0, -0.15397784113884, 0.15834286808968, -0.16270183026791, 0.16704931855202, -0.17137989401817, 0.17568805813789, -0.17996826767921, 0.18421491980553, -0.18842244148254, 0.19258520007133, -0.19669759273529, 0.2007540166378, -0.20474889874458, 0.20867666602135, -0.21253183484077, 0.21630896627903, -0.2200026512146, 0.22360759973526, -0.22711859643459, 0.23053053021431, -0.23383839428425, 0.23703727126122, -0.24012245237827, 0.24308927357197, -0.24593330919743, 0.2486502379179, -0.25123593211174, 0.25368642807007, -0.2559979557991, 0.25816693902016, -0.26019003987312, 0.26206403970718, -0.26378604769707, 0.26535332202911, -0.26676335930824, 0.2680139541626, -0.26910305023193, 0.27002888917923, -0.27078998088837, 0.27138501405716, -0.27181306481361, 0.2720732986927, -0.27216526865959, 0.2720887362957, -0.27184373140335, 0.27143058180809, -0.27084985375404, 0.27010232210159, -0.26918908953667, 0.26811149716377, -0.26687115430832, 0.26546987891197, -0.26390978693962, 0.26219320297241, -0.26032269001007, 0.25830110907555, -0.25613144040108, 0.2538169324398, -0.25136110186577, 0.24876761436462, -0.24604031443596, 0.2431832998991, -0.24020080268383, 0.23709724843502, -0.23387722671032, 0.23054547607899, -0.22710686922073, 0.22356642782688, -0.21992929279804, 0.21620073914528, -0.21238608658314, 0.20849080383778, -0.20452041924, 0.20048052072525, -0.19637675583363, 0.1922148168087, -0.1880004554987, 0.18373940885067, -0.17943744361401, 0.17510032653809, -0.17073379456997, 0.16634358465672, -0.16193540394306, 0.15751487016678, -0.15308758616447, 9129.0126953125, 736.0, 87.0, 0.15332844853401, -0.15759174525738, 0.16185063123703, -0.16610008478165, 0.17033505439758, -0.17455039918423, 0.17874094843864, -0.18290151655674, 0.18702685832977, -0.191111728549, 0.19515089690685, -0.19913911819458, 0.20307114720345, -0.20694179832935, 0.21074590086937, -0.21447832882404, 0.21813401579857, -0.22170796990395, 0.2251952290535, -0.228590965271, 0.23189043998718, -0.23508900403976, 0.23818209767342, -0.24116533994675, 0.24403443932533, -0.2467852383852, 0.24941375851631, -0.25191617012024, 0.25428879261017, -0.25652813911438, 0.25863087177277, -0.26059386134148, 0.26241418719292, -0.26408910751343, 0.26561608910561, -0.26699277758598, 0.26821711659431, -0.26928716897964, 0.27020132541656, -0.27095809578896, 0.27155634760857, -0.27199503779411, 0.27227348089218, -0.27239120006561, 0.27234789729118, -0.27214360237122, 0.27177849411964, -0.27125307917595, 0.27056807279587, -0.26972436904907, 0.26872318983078, -0.26756596565247, 0.26625427603722, -0.26479005813599, 0.26317539811134, -0.26141259074211, 0.25950419902802, -0.25745296478271, 0.2552618086338, -0.25293388962746, 0.2504725754261, -0.2478813380003, 0.24516394734383, -0.24232423305511, 0.23936624825001, -0.2362941801548, 0.23311237990856, -0.22982531785965, 0.22643759846687, -0.22295394539833, 0.21937920153141, -0.21571829915047, 0.21197627484798, -0.20815822482109, 0.20426931977272, -0.20031481981277, 0.19629998505116, -0.19223017990589, 0.18811072409153, -0.18394701182842, 0.17974443733692, -0.17550836503506, 0.17124418914318, -0.16695722937584, 0.1626528352499, -0.15833625197411, 0.15401273965836, 9396.5126953125, 757.0, 90.0, -0.15029545128345, 0.15445789694786, -0.15861994028091, 0.16277694702148, -0.16692423820496, 0.17105709016323, -0.1751707047224, 0.17926025390625, -0.18332089483738, 0.18734773993492, -0.19133591651917, 0.19528050720692, -0.19917663931847, 0.2030194401741, -0.20680405199528, 0.21052564680576, -0.21417944133282, 0.21776071190834, -0.22126477956772, 0.22468703985214, -0.22802294790745, 0.2312680631876, -0.23441801965237, 0.23746857047081, -0.24041557312012, 0.24325500428677, -0.2459829300642, 0.24859561026096, -0.25108939409256, 0.25346079468727, -0.25570651888847, 0.25782337784767, -0.2598083615303, 0.26165863871574, -0.26337161660194, 0.2649447619915, -0.26637583971024, 0.26766276359558, -0.26880365610123, 0.26979684829712, -0.27064085006714, 0.27133440971375, -0.27187651395798, 0.27226623892784, -0.27250304818153, 0.27258652448654, -0.27251642942429, 0.27229288220406, -0.27191606163979, 0.27138647437096, -0.27070480585098, 0.26987195014954, -0.26888906955719, 0.26775744557381, -0.26647865772247, 0.26505443453789, -0.26348674297333, 0.26177775859833, -0.25992980599403, 0.25794544816017, -0.25582739710808, 0.25357857346535, -0.25120204687119, 0.24870112538338, -0.24607917666435, 0.24333979189396, -0.24048671126366, 0.23752377927303, -0.23445503413677, 0.2312845736742, -0.22801665961742, 0.22465567290783, -0.22120605409145, 0.21767236292362, -0.21405924856663, 0.21037144958973, -0.20661373436451, 0.20279094576836, -0.19890800118446, 0.19496983289719, -0.1909814029932, 0.18694770336151, -0.18287374079227, 0.17876453697681, -0.17462506890297, 0.1704603433609, -0.16627533733845, 0.16207495331764, -0.15786410868168, 0.15364764630795, 9671.8515625, 779.0, 94.0, -0.15208519995213, 0.15609256923199, -0.16009685397148, 0.16409394145012, -0.1680796444416, 0.17204973101616, -0.17599995434284, 0.17992602288723, -0.1838236451149, 0.18768848478794, -0.19151625037193, 0.19530260562897, -0.19904324412346, 0.20273384451866, -0.20637015998363, 0.20994791388512, -0.21346293389797, 0.21691101789474, -0.22028806805611, 0.22359003126621, -0.22681291401386, 0.22995279729366, -0.23300582170486, 0.23596824705601, -0.2388364225626, 0.24160677194595, -0.24427582323551, 0.24684025347233, -0.24929681420326, 0.25164240598679, -0.2538740336895, 0.2559888958931, -0.25798425078392, 0.25985753536224, -0.26160633563995, 0.26322841644287, -0.26472166180611, 0.2660841345787, -0.26731404662132, 0.26840978860855, -0.26936993002892, 0.27019321918488, -0.2708785533905, 0.27142503857613, -0.27183189988136, 0.27209866046906, -0.27222490310669, 0.27221041917801, -0.27205529808998, 0.27175962924957, -0.2713238298893, 0.27074843645096, -0.27003416419029, 0.26918196678162, -0.26819288730621, 0.26706817746162, -0.26580932736397, 0.26441794633865, -0.26289576292038, 0.26124477386475, -0.25946706533432, 0.2575649023056, -0.25554069876671, 0.25339704751968, -0.25113666057587, 0.24876235425472, -0.2462771832943, 0.24368421733379, -0.24098673462868, 0.23818808794022, -0.23529174923897, 0.23230132460594, -0.22922046482563, 0.2260529845953, -0.22280271351337, 0.2194736301899, -0.21606972813606, 0.2125951051712, -0.20905390381813, 0.20545031130314, -0.20178858935833, 0.19807299971581, -0.19430786371231, 0.19049750268459, -0.18664626777172, 0.18275853991508, -0.17883864045143, 0.17489095032215, -0.17091980576515, 0.16692952811718, -0.1629243940115, 0.15890868008137, -0.15488660335541, 0.15086232125759, 9955.2587890625, 802.0, 96.0, 0.15250995755196, -0.15640918910503, 0.1603052765131, -0.16419441998005, 0.16807276010513, -0.17193642258644, 0.17578147351742, -0.17960394918919, 0.18339991569519, -0.18716537952423, 0.19089634716511, -0.19458885490894, 0.19823890924454, -0.20184253156185, 0.20539580285549, -0.2088947892189, 0.21233558654785, -0.21571435034275, 0.21902726590633, -0.22227056324482, 0.22544054687023, -0.22853358089924, 0.23154607415199, -0.23447453975677, 0.23731553554535, -0.24006573855877, 0.24272191524506, -0.24528089165688, 0.24773962795734, -0.25009521842003, 0.25234478712082, -0.25448563694954, 0.25651520490646, -0.25843101739883, 0.2602307498455, -0.2619121670723, 0.26347324252129, -0.26491206884384, 0.26622685790062, -0.26741597056389, 0.26847794651985, -0.26941147446632, 0.27021539211273, -0.27088865637779, 0.27143049240112, -0.27184015512466, 0.27211713790894, -0.27226108312607, 0.27227181196213, -0.27214926481247, 0.27189359068871, -0.27150511741638, 0.27098426222801, -0.27033165097237, 0.26954811811447, -0.268634557724, 0.26759213209152, -0.26642206311226, 0.26512578129768, -0.26370486617088, 0.26216104626656, -0.26049616932869, 0.25871226191521, -0.25681149959564, 0.25479611754417, -0.25266861915588, 0.25043147802353, -0.24808742105961, 0.2456392198801, -0.24308981001377, 0.24044218659401, -0.23769949376583, 0.23486495018005, -0.23194189369678, 0.22893370687962, -0.22584390640259, 0.22267606854439, -0.21943379938602, 0.21612083911896, -0.21274095773697, 0.209297940135, -0.20579569041729, 0.2022380977869, -0.1986290961504, 0.19497266411781, -0.19127281010151, 0.18753351271152, -0.18375879526138, 0.17995266616344, -0.17611916363239, 0.17226228117943, -0.16838598251343, 0.16449426114559, -0.16059103608131, 0.15668022632599, -0.1527656763792, 10246.969726562, 825.0, 99.0, -0.150525406003, 0.15431666374207, -0.15810693800449, 0.16189274191856, -0.16567054390907, 0.16943679749966, -0.17318789660931, 0.17692025005817, -0.18063019216061, 0.18431410193443, -0.187968313694, 0.19158914685249, -0.19517296552658, 0.19871607422829, -0.2022148668766, 0.20566569268703, -0.20906494557858, 0.2124090641737, -0.21569448709488, 0.21891771256924, -0.22207528352737, 0.22516380250454, -0.2281799018383, 0.23112028837204, -0.23398171365261, 0.23676106333733, -0.23945520818233, 0.24206118285656, -0.24457603693008, 0.2469969689846, -0.24932123720646, 0.25154620409012, -0.25366935133934, 0.25568825006485, -0.2576005756855, 0.25940415263176, -0.26109686493874, 0.2626768052578, -0.26414212584496, 0.26549112796783, -0.26672220230103, 0.26783394813538, -0.2688250541687, 0.26969435811043, -0.27044081687927, 0.27106359601021, -0.27156189084053, 0.27193516492844, -0.27218291163445, 0.27230489253998, -0.27230089902878, 0.27217093110085, -0.27191513776779, 0.27153381705284, -0.27102738618851, 0.27039641141891, -0.26964163780212, 0.26876389980316, -0.26776421070099, 0.2666437625885, -0.26540380716324, 0.26404574513435, -0.26257118582726, 0.260981798172, -0.25927940011024, 0.25746595859528, -0.25554350018501, 0.25351423025131, -0.25138047337532, 0.24914464354515, -0.24680924415588, 0.24437694251537, -0.2418504357338, 0.23923256993294, -0.23652626574039, 0.23373451828957, -0.23086042702198, 0.22790715098381, -0.2248779386282, 0.2217760682106, -0.21860493719578, 0.21536795794964, -0.21206858754158, 0.20871037244797, -0.20529687404633, 0.20183166861534, -0.19831839203835, 0.19476069509983, -0.19116225838661, 0.18752673268318, -0.18385782837868, 0.18015924096107, -0.17643465101719, 0.17268772423267, -0.16892214119434, 0.16514153778553, -0.1613495349884, 0.15754973888397, -0.15374566614628, 10547.229492188, 850.0, 102.0, 0.15364766120911, -0.15733021497726, 0.16100923717022, -0.16468150913715, 0.16834379732609, -0.17199279367924, 0.17562520503998, -0.1792376935482, 0.18282693624496, -0.18638955056667, 0.18992219865322, -0.19342151284218, 0.19688415527344, -0.20030674338341, 0.2036859691143, -0.20701850950718, 0.21030105650425, -0.21353034675121, 0.21670316159725, -0.21981626749039, 0.22286653518677, -0.22585083544254, 0.22876609861851, -0.23160932958126, 0.23437757790089, -0.23706795275211, 0.23967763781548, -0.24220389127731, 0.24464404582977, -0.24699549376965, 0.24925576150417, -0.25142240524292, 0.25349313020706, -0.25546568632126, 0.25733795762062, -0.2591078877449, 0.26077356934547, -0.26233321428299, 0.26378509402275, -0.26512759923935, 0.26635929942131, -0.2674788236618, 0.26848492026329, -0.26937648653984, 0.27015250921249, -0.27081218361855, 0.27135473489761, -0.27177953720093, 0.27208614349365, -0.27227422595024, 0.27234351634979, -0.27229392528534, 0.27212554216385, -0.27183851599693, 0.27143314480782, -0.27090987563133, 0.27026927471161, -0.26951205730438, 0.26863896846771, -0.26765105128288, 0.26654931902885, -0.26533496379852, 0.26400935649872, -0.26257389783859, 0.26103013753891, -0.25937974452972, 0.25762450695038, -0.25576633214951, 0.25380721688271, -0.25174924731255, 0.24959462881088, -0.2473456710577, 0.24500475823879, -0.24257437884808, 0.24005711078644, -0.23745559155941, 0.23477256298065, -0.23201082646847, 0.22917325794697, -0.22626280784607, 0.22328247129917, -0.22023530304432, 0.21712443232536, -0.21395300328732, 0.21072423458099, -0.20744135975838, 0.20410765707493, -0.20072643458843, 0.19730101525784, -0.19383476674557, 0.19033102691174, -0.18679320812225, 0.18322464823723, -0.17962875962257, 0.17600889503956, -0.17236845195293, 0.16871075332165, -0.16503915190697, 0.16135695576668, -0.1576674580574, 0.15397392213345, -0.1502795368433, 10856.286132812, 874.0, 106.0, 0.15065959095955, -0.15423434972763, 0.15780831873417, -0.16137859225273, 0.16494220495224, -0.16849619150162, 0.1720375418663, -0.17556323111057, 0.17907023429871, -0.18255546689034, 0.18601587414742, -0.1894484013319, 0.19284994900227, -0.19621747732162, 0.19954790174961, -0.20283818244934, 0.20608527958393, -0.2092861533165, 0.21243785321712, -0.21553735435009, 0.21858176589012, -0.22156816720963, 0.22449368238449, -0.22735550999641, 0.23015086352825, -0.2328770160675, 0.23553131520748, -0.23811113834381, 0.24061392247677, -0.24303722381592, 0.24537858366966, -0.24763570725918, 0.24980628490448, -0.25188815593719, 0.25387921929359, -0.25577741861343, 0.2575808763504, -0.25928771495819, 0.2608962059021, -0.2624047100544, 0.263811647892, -0.26511558890343, 0.26631519198418, -0.26740920543671, 0.26839646697044, -0.26927599310875, 0.27004685997963, -0.27070823311806, 0.27125942707062, -0.27169990539551, 0.27202916145325, -0.27224683761597, 0.27235272526741, -0.27234670519829, 0.27222874760628, -0.27199900150299, 0.27165767550468, -0.27120512723923, 0.27064180374146, -0.26996827125549, 0.2691852748394, -0.26829355955124, 0.267294049263, -0.26618778705597, 0.2649759054184, -0.26365959644318, 0.26224029064178, -0.26071935892105, 0.25909838080406, -0.25737902522087, 0.25556299090385, -0.25365218520164, 0.25164848566055, -0.24955393373966, 0.2473706305027, -0.24510076642036, 0.24274660646915, -0.2403105199337, 0.23779490590096, -0.23520225286484, 0.23253512382507, -0.22979612648487, 0.22698795795441, -0.22411334514618, 0.22117505967617, -0.21817593276501, 0.21511885523796, -0.21200674772263, 0.2088425308466, -0.20562919974327, 0.20236977934837, -0.19906729459763, 0.19572478532791, -0.19234532117844, 0.18893200159073, -0.18548789620399, 0.1820160895586, -0.17851966619492, 0.17500174045563, -0.17146533727646, 0.16791355609894, -0.16434940695763, 0.16077594459057, -0.15719613432884, 0.15361295640469, -0.15002936124802, 11174.400390625, 900.0, 108.0, 0.15244778990746, -0.15591430664062, 0.15937881171703, -0.1628386080265, 0.16629101336002, -0.16973330080509, 0.17316271364689, -0.17657649517059, 0.17997185885906, -0.18334603309631, 0.18669621646404, -0.19001959264278, 0.19331339001656, -0.19657477736473, 0.19980099797249, -0.20298925042152, 0.20613676309586, -0.20924080908298, 0.21229861676693, -0.21530751883984, 0.21826481819153, -0.22116786241531, 0.22401404380798, -0.22680076956749, 0.22952552139759, -0.23218579590321, 0.23477916419506, -0.23730321228504, 0.23975560069084, -0.24213406443596, 0.24443636834621, -0.24666035175323, 0.24880391359329, -0.25086504220963, 0.25284177064896, -0.2547322511673, 0.25653463602066, -0.25824722647667, 0.25986835360527, -0.26139649748802, 0.2628301680088, -0.26416796445847, 0.26540860533714, -0.26655089855194, 0.26759371161461, -0.26853606104851, 0.269376963377, -0.27011567354202, 0.27075138688087, -0.27128356695175, 0.27171158790588, -0.27203512191772, 0.27225378155708, -0.27236738801003, 0.27237582206726, -0.27227902412415, 0.27207711338997, -0.27177029848099, 0.2713588476181, -0.27084317803383, 0.270223736763, -0.26950117945671, 0.26867619156837, -0.26774954795837, 0.26672214269638, -0.26559495925903, 0.26436913013458, -0.26304578781128, 0.26162624359131, -0.26011180877686, 0.25850397348404, -0.25680428743362, 0.2550143301487, -0.25313583016396, 0.25117060542107, -0.24912044405937, 0.24698734283447, -0.24477331340313, 0.24248039722443, -0.24011078476906, 0.23766665160656, -0.23515030741692, 0.23256406188011, -0.22991029918194, 0.22719146311283, -0.22441005706787, 0.2215685993433, -0.21866966784, 0.21571588516235, -0.21270988881588, 0.20965437591076, -0.20655204355717, 0.20340563356876, -0.20021791756153, 0.19699163734913, -0.19372962415218, 0.19043463468552, -0.18710951507092, 0.18375706672668, -0.18038010597229, 0.17698141932487, -0.17356383800507, 0.17013014853001, -0.16668313741684, 0.16322554647923, -0.15976013243198, 0.15628962218761, -0.15281671285629, 11501.834960938, 927.0, 110.0, -0.15165720880032, 0.15505793690681, -0.15845833718777, 0.16185584664345, -0.16524794697762, 0.16863204538822, -0.17200553417206, 0.17536579072475, -0.17871019244194, 0.1820360571146, -0.18534074723721, 0.18862156569958, -0.19187586009502, 0.19510093331337, -0.1982941031456, 0.20145271718502, -0.20457410812378, 0.20765560865402, -0.21069458127022, 0.21368843317032, -0.21663454174995, 0.21953035891056, -0.22237330675125, 0.22516089677811, -0.22789064049721, 0.23056010901928, -0.23316687345505, 0.23570860922337, -0.23818299174309, 0.24058775603771, -0.24292071163654, 0.24517968297005, -0.24736259877682, 0.24946743249893, -0.25149220228195, 0.25343498587608, -0.25529402494431, 0.25706747174263, -0.25875371694565, 0.26035109162331, -0.26185813546181, 0.26327332854271, -0.26459535956383, 0.26582288742065, -0.26695477962494, 0.26798990368843, -0.26892724633217, 0.26976585388184, -0.27050495147705, 0.27114373445511, -0.27168157696724, 0.27211794257164, -0.27245238423347, 0.27268451452255, -0.27281409502029, 0.27284097671509, -0.27276504039764, 0.27258637547493, -0.27230510115623, 0.27192142605782, -0.27143570780754, 0.27084836363792, -0.27015990018845, 0.2693709731102, -0.26848223805428, 0.26749458909035, -0.26640886068344, 0.26522606611252, -0.26394730806351, 0.2625737786293, -0.26110669970512, 0.2595474421978, -0.25789746642113, 0.25615829229355, -0.25433146953583, 0.25241872668266, -0.25042182207108, 0.24834257364273, -0.24618288874626, 0.24394474923611, -0.24163018167019, 0.2392413020134, -0.2367802709341, 0.23424932360649, -0.23165073990822, 0.22898685932159, -0.22626005113125, 0.22347275912762, -0.22062747180462, 0.21772667765617, -0.21477295458317, 0.21176888048649, -0.2087170779705, 0.20562019944191, -0.2024808973074, 0.1993018835783, -0.1960858553648, 0.19283553957939, -0.18955367803574, 0.18624301254749, -0.18290627002716, 0.17954622209072, -0.17616559565067, 0.17276713252068, -0.16935354471207, 0.16592758893967, -0.16249191761017, 0.15904924273491, -0.15560220181942, 0.15215344727039, 11838.864257812, 954.0, 114.0, 0.15193830430508, -0.15522046387196, 0.15850205719471, -0.16178081929684, 0.16505447030067, -0.16832067072392, 0.17157709598541, -0.1748213917017, 0.17805118858814, -0.18126410245895, 0.18445774912834, -0.18762971460819, 0.19077761471272, -0.19389902055264, 0.19699154794216, -0.20005278289318, 0.20308032631874, -0.20607179403305, 0.20902480185032, -0.21193701028824, 0.21480606496334, -0.21762962639332, 0.22040539979935, -0.22313110530376, 0.22580449283123, -0.22842335700989, 0.23098549246788, -0.23348876833916, 0.23593105375767, -0.23831027746201, 0.24062442779541, -0.24287150800228, 0.24504958093166, -0.24715678393841, 0.24919126927853, -0.25115129351616, 0.25303509831429, -0.25484102964401, 0.25656750798225, -0.25821301341057, 0.25977608561516, -0.26125529408455, 0.26264929771423, -0.26395690441132, 0.26517686247826, -0.26630812883377, 0.26734960079193, -0.26830035448074, 0.26915949583054, -0.2699262201786, 0.27059984207153, -0.27117970585823, 0.27166524529457, -0.27205601334572, 0.27235159277916, -0.27255165576935, 0.27265605330467, -0.2726646065712, 0.27257725596428, -0.27239406108856, 0.27211511135101, -0.27174064517021, 0.27127096056938, -0.27070641517639, 0.27004745602608, -0.26929467916489, 0.26844865083694, -0.26751011610031, 0.26647984981537, -0.26535877585411, 0.26414778828621, -0.26284793019295, 0.26146033406258, -0.25998616218567, 0.25842669606209, -0.25678324699402, 0.25505724549294, -0.25325015187263, 0.25136351585388, -0.24939893186092, 0.24735808372498, -0.2452427148819, 0.24305461347103, -0.24079562723637, 0.23846769332886, -0.2360727339983, 0.23361280560493, -0.23108993470669, 0.22850625216961, -0.22586391866207, 0.22316509485245, -0.2204120606184, 0.21760703623295, -0.2147523611784, 0.21185034513474, -0.20890335738659, 0.20591378211975, -0.20288403332233, 0.19981652498245, -0.19671368598938, 0.19357800483704, -0.19041192531586, 0.1872179210186, -0.18399848043919, 0.18075609207153, -0.17749321460724, 0.17421235144138, -0.1709159463644, 0.16760647296906, -0.16428638994694, 0.16095811128616, -0.15762408077717, 0.15428668260574, -0.15094828605652, 12185.76953125, 981.0, 118.0, -0.15006467700005, 0.15322862565517, -0.15639300644398, 0.15955582261086, -0.16271501779556, 0.16586855053902, -0.16901431977749, 0.17215025424957, -0.17527425289154, 0.17838416993618, -0.1814778894186, 0.18455328047276, -0.18760818243027, 0.19064046442509, -0.19364798069, 0.19662855565548, -0.19958007335663, 0.20250038802624, -0.20538736879826, 0.20823886990547, -0.21105280518532, 0.21382707357407, -0.21655960381031, 0.21924830973148, -0.22189116477966, 0.22448614239693, -0.22703127563, 0.22952458262444, -0.23196412622929, 0.23434799909592, -0.23667435348034, 0.23894134163857, -0.24114717543125, 0.24329011142254, -0.24536840617657, 0.24738042056561, -0.24932453036308, 0.25119915604591, -0.25300276279449, 0.25473392009735, -0.25639113783836, 0.25797313451767, -0.25947853922844, 0.26090615987778, -0.26225474476814, 0.26352319121361, -0.26471045613289, 0.26581552624702, -0.26683741807938, 0.26777532696724, -0.26862841844559, 0.26939594745636, -0.27007722854614, 0.27067172527313, -0.27117884159088, 0.27159816026688, -0.27192929387093, 0.27217191457748, -0.27232578396797, 0.27239075303078, -0.27236670255661, 0.27225360274315, -0.27205154299736, 0.27176064252853, -0.27138105034828, 0.27091312408447, -0.27035713195801, 0.26971352100372, -0.2689827978611, 0.26816549897194, -0.26726225018501, 0.26627379655838, -0.2652008831501, 0.2640443444252, -0.26280510425568, 0.26148411631584, -0.2600824534893, 0.25860121846199, -0.25704157352448, 0.25540474057198, -0.25369203090668, 0.25190478563309, -0.25004440546036, 0.24811239540577, -0.24611023068428, 0.2440395206213, -0.24190187454224, 0.23969896137714, -0.23743252456188, 0.23510430753231, -0.23271614313126, 0.23026986420155, -0.22776739299297, 0.22521062195301, -0.22260154783726, 0.21994216740131, -0.21723449230194, 0.21448059380054, -0.21168254315853, 0.20884247124195, -0.20596249401569, 0.20304475724697, -0.20009145140648, 0.19710475206375, -0.19408683478832, 0.19103991985321, -0.18796622753143, 0.18486796319485, -0.18174734711647, 0.17860661447048, -0.1754479855299, 0.17227368056774, -0.1690858900547, 0.1658868342638, -0.16267870366573, 0.15946367383003, -0.15624390542507, 0.15302154421806, 12542.83984375, 1011.0, 120.0, -0.1519336104393, 0.15507738292217, -0.15822005271912, 0.16135962307453, -0.16449409723282, 0.16762143373489, -0.17073960602283, 0.1738465577364, -0.17694020271301, 0.18001846969128, -0.18307930231094, 0.18612058460712, -0.18914024531841, 0.19213619828224, -0.19510634243488, 0.19804859161377, -0.2009608745575, 0.20384110510349, -0.20668725669384, 0.20949725806713, -0.21226906776428, 0.21500068902969, -0.21769012510777, 0.2203353792429, -0.22293449938297, 0.22548557817936, -0.22798669338226, 0.23043596744537, -0.23283158242702, 0.23517170548439, -0.23745459318161, 0.2396784722805, -0.24184167385101, 0.24394252896309, -0.24597941339016, 0.24795077741146, -0.24985510110855, 0.25169089436531, -0.2534567117691, 0.25515124201775, -0.25677308440208, 0.25832104682922, -0.2597938477993, 0.26119035482407, -0.26250949501991, 0.26375019550323, -0.26491150259972, 0.26599246263504, -0.2669922709465, 0.26791009306908, -0.26874524354935, 0.26949700713158, -0.27016484737396, 0.27074819803238, -0.27124658226967, 0.27165964245796, -0.27198702096939, 0.2722285091877, -0.27238383889198, 0.27245298027992, -0.27243581414223, 0.27233237028122, -0.27214276790619, 0.27186712622643, -0.27150568366051, 0.27105873823166, -0.27052664756775, 0.26990985870361, -0.26920881867409, 0.26842415332794, -0.2675564289093, 0.26660639047623, -0.26557478308678, 0.26446244120598, -0.26327019929886, 0.26199907064438, -0.26065000891685, 0.25922411680222, -0.25772252678871, 0.25614637136459, -0.25449696183205, 0.25277552008629, -0.25098344683647, 0.24912211298943, -0.24719297885895, 0.24519753456116, -0.24313731491566, 0.24101392924786, -0.23882898688316, 0.23658417165279, -0.23428119719028, 0.2319218069315, -0.22950777411461, 0.22704094648361, -0.22452315688133, 0.22195629775524, -0.21934226155281, 0.21668300032616, -0.21398045122623, 0.21123662590981, -0.20845349133015, 0.20563308894634, -0.20277743041515, 0.19988858699799, -0.19696860015392, 0.19401952624321, -0.19104346632957, 0.1880424618721, -0.18501862883568, 0.18197402358055, -0.17891073226929, 0.17583082616329, -0.17273637652397, 0.16962943971157, -0.1665120869875, 0.16338633000851, -0.16025422513485, 0.15711775422096, -0.15397891402245, 0.15083968639374, 12910.373046875, 1040.0, 124.0, 0.1512984931469, -0.15433405339718, 0.1573690623045, -0.16040171682835, 0.16343021392822, -0.16645273566246, 0.16946744918823, -0.17247250676155, 0.17546604573727, -0.17844620347023, 0.18141111731529, -0.18435890972614, 0.18728768825531, -0.19019557535648, 0.19308070838451, -0.19594117999077, 0.1987751275301, -0.20158067345619, 0.20435597002506, -0.20709915459156, 0.2098083794117, -0.21248182654381, 0.21511766314507, -0.21771411597729, 0.22026938199997, -0.22278171777725, 0.22524937987328, -0.22767063975334, 0.2300438284874, -0.23236726224422, 0.23463931679726, -0.23685839772224, 0.2390229254961, -0.24113135039806, 0.24318216741085, -0.24517393112183, 0.24710519611835, -0.24897457659245, 0.25078073143959, -0.25252231955528, 0.25419813394547, -0.2558069229126, 0.25734749436378, -0.25881877541542, 0.26021963357925, -0.26154911518097, 0.26280617713928, -0.26398992538452, 0.26509949564934, -0.2661340534687, 0.26709282398224, -0.26797515153885, 0.26878035068512, -0.2695078253746, 0.2701570391655, -0.27072754502296, 0.27121889591217, -0.27163070440292, 0.27196270227432, -0.27221465110779, 0.27238634228706, -0.27247768640518, 0.27248859405518, -0.27241906523705, 0.27226915955544, -0.27203899621964, 0.27172875404358, -0.27133864164352, 0.27086901664734, -0.27032017707825, 0.26969256997108, -0.26898667216301, 0.26820296049118, -0.26734209060669, 0.26640468835831, -0.26539140939713, 0.26430305838585, -0.26314043998718, 0.26190441846848, -0.2605958878994, 0.25921580195427, -0.25776523351669, 0.25624522566795, -0.25465688109398, 0.25300136208534, -0.25127992033958, 0.24949376285076, -0.24764421582222, 0.24573260545731, -0.24376030266285, 0.24172876775265, -0.23963941633701, 0.23749376833439, -0.23529335856438, 0.23303972184658, -0.23073448240757, 0.22837923467159, -0.22597566246986, 0.22352543473244, -0.22103025019169, 0.21849185228348, -0.21591198444366, 0.21329240500927, -0.21063490211964, 0.20794130861759, -0.20521341264248, 0.20245307683945, -0.199662104249, 0.19684238731861, -0.19399575889111, 0.19112408161163, -0.18822926282883, 0.18531312048435, -0.182377576828, 0.17942446470261, -0.17645566165447, 0.17347303032875, -0.17047843337059, 0.16747371852398, -0.16446070373058, 0.16144123673439, -0.1584171205759, 0.15539014339447, -0.15236207842827, 13288.67578125, 1070.0, 129.0, 0.15136682987213, -0.15429501235485, 0.15722279250622, -0.1601485311985, 0.16307064890862, -0.1659874767065, 0.1688973903656, -0.17179872095585, 0.17468982934952, -0.17756901681423, 0.18043461441994, -0.18328492343426, 0.1861182898283, -0.18893299996853, 0.19172735512257, -0.19449968636036, 0.19724829494953, -0.19997151196003, 0.20266763865948, -0.20533502101898, 0.20797199010849, -0.21057689189911, 0.21314808726311, -0.21568395197392, 0.21818287670612, -0.22064325213432, 0.22306349873543, -0.22544206678867, 0.22777742147446, -0.23006802797318, 0.23231238126755, -0.2345090508461, 0.23665654659271, -0.23875348269939, 0.24079845845699, -0.24279011785984, 0.24472713470459, -0.24660821259022, 0.24843209981918, -0.25019755959511, 0.25190338492393, -0.25354847311974, 0.25513169169426, -0.25665193796158, 0.25810819864273, -0.25949949026108, 0.2608248591423, -0.26208341121674, 0.2632742524147, -0.26439660787582, 0.26544967293739, -0.266432762146, 0.2673451602459, -0.26818627119064, 0.26895549893379, -0.26965230703354, 0.27027624845505, -0.27082684636116, 0.27130377292633, -0.27170667052269, 0.27203527092934, -0.27228936553001, 0.27246874570847, -0.27257332205772, 0.27260303497314, -0.27255782485008, 0.27243775129318, -0.27224290370941, 0.27197343111038, -0.27162951231003, 0.27121141552925, -0.27071937918663, 0.27015382051468, -0.26951509714127, 0.26880365610123, -0.26802000403404, 0.26716470718384, -0.26623833179474, 0.26524153351784, -0.26417502760887, 0.26303949952126, -0.26183578372002, 0.26056471467018, -0.25922712683678, 0.25782397389412, -0.25635620951653, 0.25482484698296, -0.25323089957237, 0.25157552957535, -0.24985978007317, 0.24808484315872, -0.24625194072723, 0.24436229467392, -0.24241715669632, 0.24041785299778, -0.23836572468281, 0.23626211285591, -0.2341084331274, 0.2319061011076, -0.22965657711029, 0.22736130654812, -0.22502182424068, 0.22263965010643, -0.22021628916264, 0.21775335073471, -0.21525239944458, 0.21271501481533, -0.21014283597469, 0.20753747224808, -0.20490056276321, 0.20223377645016, -0.19953873753548, 0.19681715965271, -0.19407066702843, 0.19130097329617, -0.18850974738598, 0.18569865822792, -0.18286940455437, 0.18002367019653, -0.17716312408447, 0.1742894500494, -0.17140430212021, 0.16850934922695, -0.16560624539852, 0.16269662976265, -0.15978215634823, 0.15686441957951, -0.15394502878189, 0.15102557837963, 13678.063476562, 1102.0, 131.0, 0.15075668692589, -0.15360966324806, 0.15646342933178, -0.15931650996208, 0.16216740012169, -0.16501459479332, 0.16785657405853, -0.1706917732954, 0.17351865768433, -0.17633566260338, 0.17914122343063, -0.18193376064301, 0.18471170961857, -0.18747347593307, 0.19021745026112, -0.19294208288193, 0.19564574956894, -0.19832687079906, 0.20098386704922, -0.20361514389515, 0.20621913671494, -0.20879426598549, 0.21133896708488, -0.21385169029236, 0.21633088588715, -0.21877501904964, 0.22118256986141, -0.22355204820633, 0.22588194906712, -0.22817082703114, 0.23041720688343, -0.23261965811253, 0.23477678000927, -0.23688718676567, 0.23894952237606, -0.24096241593361, 0.24292458593845, -0.24483475089073, 0.24669162929058, -0.2484940290451, 0.25024074316025, -0.25193059444427, 0.25356248021126, -0.25513526797295, 0.2566479742527, -0.25809952616692, 0.25948894023895, -0.26081526279449, 0.26207765936852, -0.2632751762867, 0.26440703868866, -0.26547247171402, 0.26647073030472, -0.26740109920502, 0.26826295256615, -0.26905566453934, 0.26977869868279, -0.27043154835701, 0.27101370692253, -0.27152478694916, 0.2719644010067, -0.27233222126961, 0.27262800931931, -0.27285149693489, 0.27300250530243, -0.27308094501495, 0.27308669686317, -0.27301973104477, 0.27288007736206, -0.27266782522202, 0.27238303422928, -0.27202591300011, 0.27159669995308, -0.27109557390213, 0.27052292227745, -0.26987910270691, 0.26916447281837, -0.26837953925133, 0.26752477884293, -0.26660078763962, 0.26560807228088, -0.26454737782478, 0.26341933012009, -0.26222467422485, 0.26096418499947, -0.25963869690895, 0.25824907422066, -0.25679618120193, 0.25528103113174, -0.25370454788208, 0.25206780433655, -0.25037184357643, 0.2486177533865, -0.24680668115616, 0.24493978917599, -0.2430182993412, 0.24104343354702, -0.2390164732933, 0.23693871498108, -0.23481149971485, 0.23263615369797, -0.23041409254074, 0.22814673185349, -0.22583547234535, 0.22348180413246, -0.22108720242977, 0.21865314245224, -0.21618117392063, 0.21367283165455, -0.21112965047359, 0.20855320990086, -0.20594508945942, 0.20330689847469, -0.20064021646976, 0.1979466676712, -0.19522787630558, 0.19248546659946, -0.18972106277943, 0.18693633377552, -0.18413287401199, 0.1813123524189, -0.17847640812397, 0.17562665045261, -0.17276473343372, 0.16989228129387, -0.16701091825962, 0.16412223875523, -0.16122786700726, 0.1583293825388, -0.15542837977409, 0.15252642333508, 14078.861328125, 1134.0, 136.0, 0.15240322053432, -0.15512695908546, 0.15785014629364, -0.16057151556015, 0.16328975558281, -0.16600355505943, 0.16871157288551, -0.17141249775887, 0.17410495877266, -0.17678762972355, 0.17945915460587, -0.18211816251278, 0.18476329743862, -0.1873931735754, 0.19000643491745, -0.19260171055794, 0.19517762959003, -0.19773282110691, 0.20026591420174, -0.20277553796768, 0.20526033639908, -0.20771895349026, 0.21015003323555, -0.21255224943161, 0.21492426097393, -0.21726474165916, 0.21957239508629, -0.22184588015079, 0.22408394515514, -0.22628530859947, 0.22844868898392, -0.23057286441326, 0.23265659809113, -0.23469868302345, 0.23669792711735, -0.23865315318108, 0.24056322872639, -0.24242702126503, 0.24424339830875, -0.24601131677628, 0.24772970378399, -0.24939751625061, 0.25101375579834, -0.25257748365402, 0.2540876865387, -0.25554347038269, 0.25694397091866, -0.25828829407692, 0.25957560539246, -0.26080513000488, 0.26197612285614, -0.26308780908585, 0.26413953304291, -0.26513057947159, 0.26606038212776, -0.26692831516266, 0.26773384213448, -0.26847642660141, 0.2691555917263, -0.26977089047432, 0.27032193541527, -0.27080836892128, 0.27122983336449, -0.27158606052399, 0.2718768119812, -0.27210184931755, 0.27226102352142, -0.27235421538353, 0.27238130569458, -0.27234229445457, 0.27223712205887, -0.27206584811211, 0.27182856202126, -0.27152535319328, 0.2711563706398, -0.27072185277939, 0.27022197842598, -0.26965707540512, 0.26902741193771, -0.26833337545395, 0.26757535338402, -0.26675376296043, 0.26586911082268, -0.26492187380791, 0.26391258835793, -0.2628418803215, 0.26171037554741, -0.26051869988441, 0.25926753878593, -0.25795766711235, 0.2565898001194, -0.25516477227211, 0.25368341803551, -0.25214660167694, 0.25055518746376, -0.24891014397144, 0.24721239507198, -0.2454629689455, 0.24366284906864, -0.241813108325, 0.23991480469704, -0.23796904087067, 0.23597694933414, -0.23393967747688, 0.23185838758945, -0.22973428666592, 0.22756859660149, -0.22536255419254, 0.22311742603779, -0.22083446383476, 0.21851497888565, -0.21616028249264, 0.21377170085907, -0.21135058999062, 0.20889827609062, -0.20641614496708, 0.20390556752682, -0.20136792957783, 0.19880463182926, -0.19621707499027, 0.19360668957233, -0.19097486138344, 0.18832303583622, -0.18565262854099, 0.18296507000923, -0.18026177585125, 0.17754419147968, -0.17481373250484, 0.17207181453705, -0.16931986808777, 0.16655930876732, -0.16379155218601, 0.16101798415184, -0.15824002027512, 0.15545904636383, -0.15267641842365, 14491.404296875, 1167.0, 140.0, -0.15036551654339, 0.15307530760765, -0.1557851433754, 0.15849377214909, -0.16119989752769, 0.16390223801136, -0.16659949719906, 0.16929037868977, -0.17197355628014, 0.17464770376682, -0.1773115247488, 0.17996366322041, -0.18260279297829, 0.1852275878191, -0.18783670663834, 0.19042882323265, -0.19300258159637, 0.19555667042732, -0.19808973371983, 0.2006004601717, -0.20308753848076, 0.20554961264133, -0.20798541605473, 0.21039360761642, -0.21277292072773, 0.21512205898762, -0.21743975579739, 0.21972474455833, -0.22197577357292, 0.22419160604477, -0.22637103497982, 0.22851283848286, -0.23061583936214, 0.23267887532711, -0.23470076918602, 0.23668041825294, -0.23861669003963, 0.24050849676132, -0.2423547655344, 0.24415446817875, -0.24590657651424, 0.24761009216309, -0.2492640465498, 0.25086748600006, -0.25241950154305, 0.25391921401024, -0.25536572933197, 0.25675824284554, -0.25809592008591, 0.25937804579735, -0.26060384511948, 0.26177260279655, -0.26288366317749, 0.26393637061119, -0.26493009924889, 0.26586431264877, -0.26673844456673, 0.26755198836327, -0.26830449700356, 0.26899549365044, -0.26962462067604, 0.27019149065018, -0.27069580554962, 0.27113720774651, -0.27151554822922, 0.27183052897453, -0.27208200097084, 0.27226981520653, -0.27239388227463, 0.2724541425705, -0.27245056629181, 0.27238318324089, -0.27225199341774, 0.27205711603165, -0.27179870009422, 0.27147686481476, -0.27109181880951, 0.27064383029938, -0.27013313770294, 0.26956006884575, -0.26892498135567, 0.26822826266289, -0.2674703001976, 0.26665157079697, -0.26577258110046, 0.26483383774757, -0.26383590698242, 0.26277938485146, -0.26166486740112, 0.26049306988716, -0.25926464796066, 0.25798034667969, -0.25664091110229, 0.25524711608887, -0.25379979610443, 0.25229978561401, -0.25074794888496, 0.24914519488811, -0.24749244749546, 0.24579067528248, -0.24404084682465, 0.24224396049976, -0.24040105938911, 0.23851317167282, -0.23658138513565, 0.23460678756237, -0.23259049654007, 0.23053362965584, -0.22843734920025, 0.22630283236504, -0.22413125634193, 0.221923828125, -0.21968173980713, 0.21740625798702, -0.21509858965874, 0.21276000142097, -0.2103917747736, 0.20799516141415, -0.20557145774364, 0.20312194526196, -0.2006479203701, 0.19815069437027, -0.19563157856464, 0.19309186935425, -0.19053289294243, 0.18795597553253, -0.18536241352558, 0.18275353312492, -0.18013064563274, 0.17749507725239, -0.17484813928604, 0.17219111323357, -0.16952532529831, 0.16685205698013, -0.16417261958122, 0.16148826479912, -0.15880027413368, 0.15610991418362, -0.15341843664646, 0.1507270783186, 14916.034179688, 1201.0, 145.0, -0.15197026729584, 0.15457732975483, -0.15718406438828, 0.15978935360909, -0.16239203512669, 0.16499094665051, -0.16758497059345, 0.17017289996147, -0.17275357246399, 0.17532582581043, -0.17788845300674, 0.18044029176235, -0.1829801350832, 0.18550679087639, -0.18801906704903, 0.19051577150822, -0.19299571216106, 0.19545769691467, -0.19790053367615, 0.20032303035259, -0.20272399485111, 0.20510226488113, -0.20745664834976, 0.20978598296642, -0.21208912134171, 0.21436488628387, -0.21661214530468, 0.21882976591587, -0.2210166156292, 0.22317159175873, -0.22529357671738, 0.22738148272038, -0.22943425178528, 0.23145079612732, -0.23343010246754, 0.23537111282349, -0.23727284371853, 0.23913426697254, -0.24095442891121, 0.24273236095905, -0.24446713924408, 0.24615783989429, -0.24780355393887, 0.24940341711044, -0.250956594944, 0.25246223807335, -0.25391951203346, 0.2553277015686, -0.25668603181839, 0.25799375772476, -0.25925016403198, 0.26045459508896, -0.26160642504692, 0.26270496845245, -0.26374968886375, 0.2647400200367, -0.26567539572716, 0.26655530929565, -0.26737931370735, 0.26814696192741, -0.26885780692101, 0.26951149106026, -0.2701076567173, 0.27064597606659, -0.2711261510849, 0.27154794335365, -0.27191114425659, 0.27221551537514, -0.27246090769768, 0.27264723181725, -0.27277433872223, 0.27284219861031, -0.27285078167915, 0.27280008792877, -0.27269014716148, 0.27252101898193, -0.27229282259941, 0.27200567722321, -0.27165976166725, 0.27125528454781, -0.27079245448112, 0.27027153968811, -0.26969283819199, 0.2690566778183, -0.26836341619492, 0.26761347055435, -0.26680719852448, 0.26594507694244, -0.26502761244774, 0.26405531167984, -0.26302868127823, 0.26194828748703, -0.26081475615501, 0.25962871313095, -0.25839078426361, 0.25710168480873, -0.2557620704174, 0.25437268614769, -0.25293433666229, 0.25144773721695, -0.24991373717785, 0.2483331412077, -0.24670679867268, 0.24503560364246, -0.24332043528557, 0.24156221747398, -0.2397618740797, 0.23792037367821, -0.23603866994381, 0.23411777615547, -0.23215869069099, 0.2301624417305, -0.22813007235527, 0.22606262564659, -0.22396118938923, 0.22182683646679, -0.21966065466404, 0.21746376156807, -0.21523725986481, 0.21298231184483, -0.21070000529289, 0.2083915323019, -0.20605801045895, 0.20370061695576, -0.20132051408291, 0.19891886413097, -0.19649685919285, 0.19405564665794, -0.19159643352032, 0.18912038207054, -0.18662868440151, 0.18412253260612, -0.18160307407379, 0.17907151579857, -0.17652903497219, 0.17397679388523, -0.17141596972942, 0.16884770989418, -0.16627319157124, 0.16369356215, -0.16110995411873, 0.15852351486683, -0.15593536198139, 0.15334664285183, -0.15075843036175, 15353.107421875, 1237.0, 148.0, -0.15221053361893, 0.15472109615803, -0.15723180770874, 0.15974166989326, -0.16224963963032, 0.16475470364094, -0.16725580394268, 0.16975191235542, -0.17224198579788, 0.17472493648529, -0.1771997064352, 0.17966523766518, -0.18212044239044, 0.18456426262856, -0.18699559569359, 0.1894133836031, -0.19181652367115, 0.19420392811298, -0.19657452404499, 0.1989272236824, -0.20126093924046, 0.20357459783554, -0.20586712658405, 0.20813743770123, -0.21038447320461, 0.21260716021061, -0.21480445563793, 0.21697528660297, -0.21911861002445, 0.22123341262341, -0.22331863641739, 0.2253732830286, -0.22739633917809, 0.2293868213892, -0.23134371638298, 0.23326605558395, -0.2351528853178, 0.23700326681137, -0.2388162612915, 0.24059094488621, -0.24232642352581, 0.2440218180418, -0.24567623436451, 0.24728885293007, -0.24885880947113, 0.25038531422615, -0.25186756253242, 0.25330480933189, -0.25469624996185, 0.25604116916656, -0.25733888149261, 0.25858867168427, -0.25978988409042, 0.26094189286232, -0.26204407215118, 0.26309579610825, -0.2640965282917, 0.26504573225975, -0.26594284176826, 0.26678743958473, -0.26757898926735, 0.2683170735836, -0.2690013051033, 0.26963126659393, -0.27020663022995, 0.27072706818581, -0.27119222283363, 0.27160188555717, -0.27195581793785, 0.27225375175476, -0.27249553799629, 0.27268102765083, -0.27281007170677, 0.27288258075714, -0.2728984951973, 0.27285775542259, -0.27276039123535, 0.27260640263557, -0.27239587903023, 0.27212882041931, -0.27180543541908, 0.27142578363419, -0.2709901034832, 0.27049854397774, -0.2699513733387, 0.26934885978699, -0.26869124174118, 0.26797887682915, -0.26721209287643, 0.26639127731323, -0.26551684737206, 0.26458922028542, -0.26360884308815, 0.26257622241974, -0.26149186491966, 0.26035630702972, -0.25917011499405, 0.25793388485909, -0.2566482424736, 0.25531381368637, -0.25393131375313, 0.25250136852264, -0.2510247528553, 0.24950215220451, -0.24793435633183, 0.24632215499878, -0.24466635286808, 0.24296775460243, -0.24122723937035, 0.23944564163685, -0.23762385547161, 0.23576280474663, -0.23386338353157, 0.23192656040192, -0.22995325922966, 0.2279444783926, -0.22590118646622, 0.22382439672947, -0.22171512246132, 0.21957439184189, -0.2174032330513, 0.21520271897316, -0.21297389268875, 0.21071784198284, -0.20843563973904, 0.2061283737421, -0.20379716157913, 0.20144310593605, -0.19906729459763, 0.19667087495327, -0.19425496459007, 0.19182068109512, -0.18936914205551, 0.18690150976181, -0.18441890180111, 0.18192246556282, -0.17941331863403, 0.17689260840416, -0.17436146736145, 0.17182102799416, -0.16927240788937, 0.16671673953533, -0.16415514051914, 0.16158874332905, -0.15901863574982, 0.15644593536854, -0.15387171506882, 0.15129709243774, 15802.98828125, 1273.0, 152.0, -0.15114094316959, 0.15363050997257, -0.15611976385117, 0.15860772132874, -0.16109338402748, 0.16357573866844, -0.16605381667614, 0.16852657496929, -0.1709930151701, 0.1734521239996, -0.1759028583765, 0.17834420502186, -0.18077512085438, 0.18319457769394, -0.18560156226158, 0.18799501657486, -0.19037392735481, 0.19273725152016, -0.19508396089077, 0.19741301238537, -0.19972340762615, 0.20201408863068, -0.2042840719223, 0.20653232932091, -0.20875783264637, 0.21095961332321, -0.21313664317131, 0.21528795361519, -0.21741256117821, 0.21950948238373, -0.22157776355743, 0.22361645102501, -0.2256246060133, 0.22760128974915, -0.22954557836056, 0.2314565628767, -0.23333336412907, 0.23517510294914, -0.23698088526726, 0.23874989151955, -0.24048127233982, 0.24217419326305, -0.24382787942886, 0.24544151127338, -0.24701435863972, 0.24854563176632, -0.25003463029861, 0.25148060917854, -0.25288289785385, 0.25424081087112, -0.25555369257927, 0.25682094693184, -0.25804191827774, 0.25921601057053, -0.26034271717072, 0.26142141222954, -0.26245164871216, 0.26343289017677, -0.26436468958855, 0.26524657011032, -0.26607808470726, 0.26685890555382, -0.26758858561516, 0.26826679706573, -0.26889321208, 0.26946753263474, -0.26998949050903, 0.27045881748199, -0.27087533473969, 0.27123880386353, -0.27154904603958, 0.27180594205856, -0.27200937271118, 0.27215924859047, -0.27225551009178, 0.27229809761047, -0.27228704094887, 0.27222231030464, -0.27210396528244, 0.27193206548691, -0.27170675992966, 0.27142810821533, -0.27109628915787, 0.2707114815712, -0.27027386426926, 0.26978370547295, -0.26924121379852, 0.26864668726921, -0.26800042390823, 0.26730278134346, -0.26655408740044, 0.26575472950935, -0.26490512490273, 0.26400569081306, -0.26305687427521, 0.26205915212631, -0.26101303100586, 0.25991901755333, -0.25877767801285, 0.25758957862854, -0.25635528564453, 0.25507542490959, -0.25375065207481, 0.25238156318665, -0.2509688436985, 0.24951320886612, -0.24801534414291, 0.24647599458694, -0.24489590525627, 0.24327582120895, -0.2416165471077, 0.23991885781288, -0.23818357288837, 0.2364115267992, -0.23460355401039, 0.23276051878929, -0.23088327050209, 0.22897273302078, -0.22702975571156, 0.22505527734756, -0.22305020689964, 0.22101546823978, -0.21895200014114, 0.21686075627804, -0.21474270522594, 0.21259878575802, -0.21042999625206, 0.20823729038239, -0.20602168142796, 0.20378413796425, -0.20152567327023, 0.19924727082253, -0.19694992899895, 0.19463467597961, -0.19230252504349, 0.18995445966721, -0.18759149312973, 0.18521466851234, -0.18282496929169, 0.18042340874672, -0.1780110001564, 0.1755887567997, -0.17315767705441, 0.17071875929832, -0.16827300190926, 0.16582138836384, -0.16336493194103, 0.16090458631516, -0.15844134986401, 0.15597616136074, -0.15351001918316, 0.15104383230209, 16266.05078125, 1309.0, 159.0, -0.15057297050953, 0.15296752750874, -0.15536248683929, 0.15775699913502, -0.16015015542507, 0.16254107654095, -0.16492888331413, 0.16731265187263, -0.16969150304794, 0.17206451296806, -0.174430757761, 0.17678934335709, -0.17913933098316, 0.18147979676723, -0.18380983173847, 0.18612851202488, -0.18843488395214, 0.19072805345058, -0.19300708174706, 0.1952710300684, -0.19751897454262, 0.19975002110004, -0.20196321606636, 0.20415766537189, -0.20633244514465, 0.2084866464138, -0.21061936020851, 0.21272970736027, -0.21481676399708, 0.21687966585159, -0.2189175337553, 0.2209294885397, -0.22291466593742, 0.22487220168114, -0.22680126130581, 0.22870101034641, -0.23057059943676, 0.23240923881531, -0.23421612381935, 0.23599043488503, -0.23773141205311, 0.23943828046322, -0.2411102950573, 0.24274669587612, -0.24434676766396, 0.24590981006622, -0.24743509292603, 0.24892196059227, -0.25036975741386, 0.25177779793739, -0.25314545631409, 0.25447216629982, -0.2557572722435, 0.257000207901, -0.25820043683052, 0.25935739278793, -0.26047056913376, 0.26153942942619, -0.2625635266304, 0.26354238390923, -0.26447555422783, 0.2653626203537, -0.26620316505432, 0.26699683070183, -0.26774325966835, 0.26844209432602, -0.26909300684929, 0.26969572901726, -0.27024999260902, 0.27075555920601, -0.27121216058731, 0.271619617939, -0.27197775244713, 0.27228638529778, -0.27254542708397, 0.27275469899178, -0.27291420102119, 0.27302378416061, -0.27308347821236, 0.27309319376945, -0.27305299043655, 0.27296289801598, -0.27282291650772, 0.27263316512108, -0.27239376306534, 0.27210476994514, -0.27176636457443, 0.27137872576714, -0.27094203233719, 0.27045649290085, -0.26992234587669, 0.26933985948563, -0.26870930194855, 0.26803097128868, -0.26730519533157, 0.26653236150742, -0.26571276783943, 0.26484686136246, -0.26393502950668, 0.26297768950462, -0.26197531819344, 0.26092833280563, -0.25983729958534, 0.25870269536972, -0.25752502679825, 0.25630486011505, -0.25504276156425, 0.25373929738998, -0.25239512324333, 0.2510107755661, -0.24958695471287, 0.2481242865324, -0.2466234266758, 0.24508509039879, -0.24350994825363, 0.24189871549606, -0.24025212228298, 0.23857091367245, -0.23685583472252, 0.23510764539242, -0.23332715034485, 0.23151510953903, -0.22967232763767, 0.2277996391058, -0.22589783370495, 0.22396777570248, -0.22201026976109, 0.22002618014812, -0.21801637113094, 0.21598169207573, -0.21392303705215, 0.21184125542641, -0.20973724126816, 0.20761187374592, -0.20546607673168, 0.2033007144928, -0.2011166960001, 0.19891494512558, -0.19669634103775, 0.19446179270744, -0.19221223890781, 0.18994855880737, -0.18767167627811, 0.18538251519203, -0.1830819696188, 0.18077093362808, -0.17845034599304, 0.17612110078335, -0.17378409206867, 0.17144022881985, -0.16909039020538, 0.16673547029495, -0.16437637805939, 0.16201396286488, -0.15964911878109, 0.15728269517422, -0.15491557121277, 0.15254858136177, -0.15018258988857, 16742.681640625, 1348.0, 163.0, 0.15084235370159, -0.15312552452087, 0.15540930628777, -0.15769296884537, 0.15997572243214, -0.16225682199001, 0.16453547775745, -0.16681091487408, 0.16908234357834, -0.1713489741087, 0.17361001670361, -0.17586466670036, 0.17811211943626, -0.1803515702486, 0.18258221447468, -0.18480324745178, 0.18701383471489, -0.1892131716013, 0.1914004534483, -0.19357484579086, 0.19573554396629, -0.19788171350956, 0.20001257956028, -0.2021272778511, 0.20422503352165, -0.20630502700806, 0.20836642384529, -0.21040846407413, 0.2124302983284, -0.21443116664886, 0.21641026437283, -0.21836678683758, 0.2202999740839, -0.22220902144909, 0.22409318387508, -0.2259516865015, 0.22778376936913, -0.22958868741989, 0.23136568069458, -0.23311403393745, 0.23483301699162, -0.23652191460133, 0.23818001151085, -0.23980660736561, 0.24140104651451, -0.24296261370182, 0.24449068307877, -0.24598456919193, 0.24744366109371, -0.24886730313301, 0.25025489926338, -0.25160586833954, 0.25291958451271, -0.25419548153877, 0.25543302297592, -0.25663164258003, 0.2577908039093, -0.25891003012657, 0.25998878479004, -0.26102662086487, 0.26202303171158, -0.26297760009766, 0.26388987898827, -0.26475945115089, 0.26558595895767, -0.26636895537376, 0.26710814237595, -0.26780313253403, 0.26845362782478, -0.26905930042267, 0.26961985230446, -0.2701350748539, 0.27060464024544, -0.27102839946747, 0.27140608429909, -0.27173751592636, 0.27202254533768, -0.2722609937191, 0.27245274186134, -0.27259770035744, 0.27269574999809, -0.27274683117867, 0.27275088429451, -0.27270790934563, 0.27261787652969, -0.27248081564903, 0.27229675650597, -0.27206572890282, 0.27178782224655, -0.27146312594414, 0.27109175920486, -0.27067387104034, 0.27020961046219, -0.26969915628433, 0.26914268732071, -0.2685404419899, 0.26789265871048, -0.26719954609871, 0.26646146178246, -0.26567861437798, 0.26485139131546, -0.26398012042046, 0.26306509971619, -0.26210674643517, 0.26110544800758, -0.26006159186363, 0.25897565484047, -0.25784802436829, 0.25667920708656, -0.25546965003014, 0.25421985983849, -0.25293040275574, 0.25160172581673, -0.25023445487022, 0.24882909655571, -0.24738626182079, 0.24590654671192, -0.24439053237438, 0.24283887445927, -0.24125219881535, 0.23963116109371, -0.23797641694546, 0.236288651824, -0.23456856608391, 0.2328168451786, -0.23103423416615, 0.22922141849995, -0.22737918794155, 0.22550824284554, -0.22360937297344, 0.22168333828449, -0.21973091363907, 0.21775288879871, -0.21575005352497, 0.21372322738171, -0.21167320013046, 0.20960080623627, -0.20750686526299, 0.20539219677448, -0.20325765013695, 0.20110405981541, -0.19893227517605, 0.19674314558506, -0.19453750550747, 0.19231623411179, -0.19008019566536, 0.18783022463322, -0.18556718528271, 0.1832919716835, -0.18100541830063, 0.1787084043026, -0.1764017790556, 0.17408642172813, -0.17176319658756, 0.16943295300007, -0.167096555233, 0.16475485265255, -0.1624086946249, 0.1600589454174, -0.15770643949509, 0.15535201132298, -0.15299651026726, 0.1506407558918, 17233.28125, 1388.0, 166.0, 0.15189090371132, -0.15417245030403, 0.15645350515842, -0.1587333381176, 0.16101117432117, -0.16328623890877, 0.16555775702, -0.16782496869564, 0.17008708417416, -0.17234332859516, 0.17459289729595, -0.17683501541615, 0.17906887829304, -0.18129371106625, 0.18350870907307, -0.18571308255196, 0.18790604174137, -0.19008679687977, 0.19225452840328, -0.19440847635269, 0.19654783606529, -0.19867181777954, 0.20077963173389, -0.20287051796913, 0.20494365692139, -0.20699831843376, 0.20903368294239, -0.21104902029037, 0.21304355561733, -0.21501651406288, 0.21696716547012, -0.218894764781, 0.22079855203629, -0.22267781198025, 0.22453182935715, -0.22635985910892, 0.22816121578217, -0.22993519902229, 0.23168110847473, -0.23339825868607, 0.2350859940052, -0.23674362897873, 0.23837053775787, -0.23996606469154, 0.24152959883213, -0.2430604994297, 0.24455818533897, -0.24602203071117, 0.2474514991045, -0.24884597957134, 0.25020495057106, -0.25152787566185, 0.25281417369843, -0.25406339764595, 0.25527504086494, -0.2564485669136, 0.25758358836174, -0.25867956876755, 0.25973612070084, -0.26075282692909, 0.2617292702198, -0.26266506314278, 0.26355984807014, -0.26441323757172, 0.26522490382195, -0.26599454879761, 0.26672184467316, -0.26740649342537, 0.26804825663567, -0.26864689588547, 0.26920214295387, -0.2697137594223, 0.27018162608147, -0.27060550451279, 0.27098524570465, -0.27132070064545, 0.27161177992821, -0.27185833454132, 0.27206030488014, -0.27221763134003, 0.27233022451401, -0.27239808440208, 0.27242121100426, -0.2723995745182, 0.27233323454857, -0.27222222089767, 0.27206659317017, -0.27186641097069, 0.27162182331085, -0.27133291959763, 0.27099984884262, -0.27062276005745, 0.27020180225372, -0.26973721385002, 0.26922914385796, -0.26867786049843, 0.26808363199234, -0.26744666695595, 0.26676723361015, -0.26604568958282, 0.26528233289719, -0.26447746157646, 0.26363143324852, -0.26274460554123, 0.26181736588478, -0.26085013151169, 0.25984328985214, -0.25879725813866, 0.25771245360374, -0.25658941268921, 0.25542852282524, -0.25423032045364, 0.25299528241158, -0.25172391533852, 0.25041675567627, -0.24907433986664, 0.24769721925259, -0.24628596007824, 0.24484111368656, -0.24336330592632, 0.24185311794281, -0.24031114578247, 0.23873803019524, -0.23713439702988, 0.23550088703632, -0.23383815586567, 0.23214684426785, -0.23042763769627, 0.22868120670319, -0.22690825164318, 0.2251094430685, -0.22328549623489, 0.22143711149693, -0.21956500411034, 0.21766988933086, -0.21575251221657, 0.21381358802319, -0.21185384690762, 0.20987404882908, -0.20787490904331, 0.2058572024107, -0.2038216739893, 0.20176908373833, -0.19970017671585, 0.19761571288109, -0.19551645219326, 0.19340316951275, -0.19127660989761, 0.18913754820824, -0.18698674440384, 0.18482495844364, -0.18265296518803, 0.18047150969505, -0.1782813668251, 0.17608328163624, -0.17387801408768, 0.17166630923748, -0.16944892704487, 0.16722662746906, -0.16500011086464, 0.16277015209198, -0.16053748130798, 0.15830281376839, -0.15606686472893, 0.15383037924767, -0.15159405767918, 17738.25390625, 1429.0, 170.0, -0.15014600753784, 0.1523480117321, -0.15455140173435, 0.1567555218935, -0.15895965695381, 0.16116315126419, -0.16336527466774, 0.16556532680988, -0.16776262223721, 0.16995643079281, -0.17214603722095, 0.17433071136475, -0.17650973796844, 0.17868238687515, -0.18084792792797, 0.18300563097, -0.18515473604202, 0.1872945278883, -0.18942426145077, 0.19154317677021, -0.19365055859089, 0.19574566185474, -0.19782771170139, 0.19989600777626, -0.20194979012012, 0.20398831367493, -0.20601083338261, 0.20801663398743, -0.21000497043133, 0.21197511255741, -0.21392633020878, 0.21585790812969, -0.21776910126209, 0.2196592092514, -0.22152753174305, 0.22337333858013, -0.22519594430923, 0.22699463367462, -0.2287687510252, 0.23051758110523, -0.23224046826363, 0.23393672704697, -0.23560571670532, 0.23724676668644, -0.23885925114155, 0.24044252932072, -0.24199596047401, 0.24351894855499, -0.24501086771488, 0.24647115170956, -0.24789917469025, 0.24929440021515, -0.25065624713898, 0.25198417901993, -0.25327762961388, 0.25453609228134, -0.25575903058052, 0.25694599747658, -0.25809642672539, 0.25920990109444, -0.26028594374657, 0.26132410764694, -0.26232397556305, 0.26328510046005, -0.26420709490776, 0.26508954167366, -0.26593211293221, 0.2667344212532, -0.26749613881111, 0.26821693778038, -0.26889652013779, 0.26953455805779, -0.2701308131218, 0.27068498730659, -0.27119687199593, 0.27166619896889, -0.27209281921387, 0.27247649431229, -0.27281707525253, 0.27311435341835, -0.27336826920509, 0.27357864379883, -0.27374538779259, 0.27386844158173, -0.27394768595695, 0.27398309111595, -0.27397465705872, 0.2739223241806, -0.27382612228394, 0.27368608117104, -0.27350223064423, 0.27327460050583, -0.27300330996513, 0.27268841862679, -0.2723300755024, 0.27192836999893, -0.27148351073265, 0.27099558711052, -0.27046483755112, 0.26989144086838, -0.26927563548088, 0.26861763000488, -0.26791769266129, 0.26717609167099, -0.26639312505722, 0.2655690908432, -0.26470428705215, 0.26379907131195, -0.26285383105278, 0.26186886429787, -0.26084461808205, 0.25978147983551, -0.25867983698845, 0.25754016637802, -0.25636285543442, 0.25514844059944, -0.25389733910561, 0.25261008739471, -0.2512871325016, 0.24992904067039, -0.24853633344173, 0.24710956215858, -0.24564926326275, 0.24415601789951, -0.24263040721416, 0.24107302725315, -0.23948447406292, 0.2378653883934, -0.23621636629105, 0.23453807830811, -0.23283115029335, 0.23109623789787, -0.22933402657509, 0.22754518687725, -0.22573038935661, 0.22389034926891, -0.2220257371664, 0.22013729810715, -0.21822571754456, 0.21629174053669, -0.21433606743813, 0.21235947310925, -0.21036265790462, 0.20834639668465, -0.20631141960621, 0.20425848662853, -0.20218835771084, 0.20010179281235, -0.19799955189228, 0.19588240981102, -0.19375112652779, 0.19160649180412, -0.18944925069809, 0.18728020787239, -0.18510010838509, 0.18290974199772, -0.18070986866951, 0.178501278162, -0.17628473043442, 0.1740610152483, -0.17183087766171, 0.16959507763386, -0.16735441982746, 0.16510961949825, -0.16286146640778, 0.16061069071293, -0.15835805237293, 0.15610429644585, -0.15385015308857, 0.15159636735916, 18258.025390625, 1471.0, 175.0, -0.15173524618149, 0.15388685464859, -0.15603785216808, 0.1581876128912, -0.160335496068, 0.16248087584972, -0.16462306678295, 0.16676147282124, -0.16889539361, 0.17102420330048, -0.17314723134041, 0.17526383697987, -0.17737333476543, 0.17947508394718, -0.18156842887402, 0.18365268409252, -0.18572719395161, 0.18779130280018, -0.18984435498714, 0.19188566505909, -0.19391459226608, 0.19593046605587, -0.19793263077736, 0.19992043077946, -0.20189321041107, 0.20385032892227, -0.2057911157608, 0.2077149450779, -0.20962117612362, 0.21150915324688, -0.21337825059891, 0.21522784233093, -0.21705728769302, 0.21886599063873, -0.22065332531929, 0.22241866588593, -0.22416144609451, 0.22588102519512, -0.22757685184479, 0.2292483150959, -0.23089483380318, 0.23251587152481, -0.23411083221436, 0.23567917943001, -0.2372203618288, 0.23873384296894, -0.24021910130978, 0.24167560040951, -0.24310284852982, 0.24450032413006, -0.24586755037308, 0.24720405042171, -0.24850933253765, 0.24978296458721, -0.2510244846344, 0.25223341584206, -0.25340938568115, 0.25455197691917, -0.25566074252129, 0.2567352950573, -0.25777530670166, 0.25878036022186, -0.25975009799004, 0.26068416237831, -0.26158228516579, 0.26244410872459, -0.26326930522919, 0.26405760645866, -0.26480874419212, 0.26552242040634, -0.26619839668274, 0.26683646440506, -0.2674363553524, 0.26799786090851, -0.26852080225945, 0.26900500059128, -0.26945027709007, 0.26985648274422, -0.2702234685421, 0.27055111527443, -0.27083930373192, 0.27108791470528, -0.27129691839218, 0.27146622538567, -0.27159577608109, 0.27168551087379, -0.27173545956612, 0.27174556255341, -0.27171584963799, 0.27164632081985, -0.27153703570366, 0.27138805389404, -0.27119937539101, 0.27097114920616, -0.27070343494415, 0.27039632201195, -0.27004995942116, 0.2696644961834, -0.26924005150795, 0.26877677440643, -0.26827490329742, 0.26773455739021, -0.2671560049057, 0.26653942465782, -0.26588508486748, 0.26519319415092, -0.26446402072906, 0.26369786262512, -0.26289498806, 0.26205566525459, -0.2611802816391, 0.2602690756321, -0.25932243466377, 0.258340716362, -0.25732421875, 0.25627338886261, -0.2551885843277, 0.25407016277313, -0.25291860103607, 0.25173425674438, -0.25051757693291, 0.24926899373531, -0.24798898398876, 0.24667797982693, -0.24533645808697, 0.2439649105072, -0.24256381392479, 0.24113366007805, -0.23967497050762, 0.23818825185299, -0.23667402565479, 0.23513282835484, -0.23356519639492, 0.23197166621685, -0.23035281896591, 0.22870920598507, -0.22704137861729, 0.22534993290901, -0.22363543510437, 0.22189848124981, -0.22013966739178, 0.21835957467556, -0.21655882894993, 0.21473801136017, -0.21289776265621, 0.21103866398335, -0.20916137099266, 0.20726649463177, -0.20535466074944, 0.20342648029327, -0.20148262381554, 0.19952370226383, -0.19755034148693, 0.19556321203709, -0.19356293976307, 0.19155015051365, -0.18952551484108, 0.18748964369297, -0.18544322252274, 0.18338684737682, -0.18132120370865, 0.17924690246582, -0.17716459929943, 0.17507493495941, -0.17297855019569, 0.17087607085705, -0.16876813769341, 0.1666553914547, -0.16453845798969, 0.16241796314716, -0.16029453277588, 0.15816877782345, -0.1560413390398, 0.15391279757023, -0.15178379416466, 18793.025390625, 1515.0, 178.0, -0.15103794634342, 0.15316334366798, -0.15528981387615, 0.15741677582264, -0.15954357385635, 0.16166961193085, -0.16379424929619, 0.16591686010361, -0.16803678870201, 0.17015342414379, -0.17226609587669, 0.17437416315079, -0.17647698521614, 0.17857390642166, -0.18066427111626, 0.18274740874767, -0.18482267856598, 0.18688941001892, -0.18894693255424, 0.19099460542202, -0.19303175806999, 0.19505773484707, -0.19707185029984, 0.19907346367836, -0.20106190443039, 0.20303651690483, -0.20499663054943, 0.20694161951542, -0.20887079834938, 0.21078352630138, -0.21267914772034, 0.21455703675747, -0.21641652286053, 0.2182569950819, -0.2200777977705, 0.22187831997871, -0.22365790605545, 0.22541595995426, -0.22715187072754, 0.22886501252651, -0.23055478930473, 0.23222059011459, -0.23386184871197, 0.23547796905041, -0.23706838488579, 0.23863250017166, -0.24016979336739, 0.24167966842651, -0.24316161870956, 0.24461509287357, -0.24603955447674, 0.24743449687958, -0.24879941344261, 0.25013381242752, -0.25143718719482, 0.25270906090736, -0.25394895672798, 0.25515645742416, -0.25633111596107, 0.25747245550156, -0.2585800588131, 0.25965356826782, -0.26069250702858, 0.26169654726982, -0.26266530156136, 0.26359841227531, -0.26449549198151, 0.26535624265671, -0.26618033647537, 0.26696747541428, -0.26771733164787, 0.26842963695526, -0.26910412311554, 0.26974052190781, -0.27033862471581, 0.27089819312096, -0.27141898870468, 0.27190083265305, -0.27234354615211, 0.27274698019028, -0.27311092615128, 0.27343529462814, -0.27371993660927, 0.27396476268768, -0.2741696536541, 0.27433454990387, -0.27445939183235, 0.2745441198349, -0.27458867430687, 0.27459308505058, -0.27455735206604, 0.27448144555092, -0.27436539530754, 0.27420929074287, -0.27401313185692, 0.27377703785896, -0.27350109815598, 0.2731853723526, -0.27283000946045, 0.27243515849113, -0.27200093865395, 0.27152752876282, -0.27101510763168, 0.27046385407448, -0.26987397670746, 0.2692457139492, -0.26857927441597, 0.26787495613098, -0.26713296771049, 0.26635363698006, -0.26553723216057, 0.26468405127525, -0.26379442214966, 0.26286867260933, -0.26190716028214, 0.26091024279594, -0.25987827777863, 0.25881165266037, -0.25771075487137, 0.25657603144646, -0.25540786981583, 0.25420668721199, -0.25297296047211, 0.25170713663101, -0.25040969252586, 0.24908106029034, -0.24772176146507, 0.24633228778839, -0.24491314589977, 0.24346485733986, -0.24198794364929, 0.24048292636871, -0.23895037174225, 0.2373908162117, -0.23580482602119, 0.23419296741486, -0.23255583643913, 0.23089399933815, -0.22920803725719, 0.22749857604504, -0.22576619684696, 0.22401151061058, -0.22223515808582, 0.22043773531914, -0.21861989796162, 0.21678224205971, -0.21492543816566, 0.2130500972271, -0.21115688979626, 0.20924645662308, -0.20731943845749, 0.20537650585175, -0.20341831445694, 0.20144551992416, -0.19945877790451, 0.19745875895023, -0.19544613361359, 0.19342155754566, -0.19138570129871, 0.189339235425, -0.18728283047676, 0.18521712720394, -0.18314282596111, 0.18106056749821, -0.17897103726864, 0.17687487602234, -0.1747727394104, 0.17266531288624, -0.17055323719978, 0.16843715310097, -0.16631773114204, 0.16419559717178, -0.16207142174244, 0.15994580090046, -0.1578194051981, 0.15569284558296, -0.15356676280499, 0.15144175291061, 19343.703125, 1556.0, 191.0, 0.15050372481346, -0.15244318544865, 0.15438286960125, -0.15632231533527, 0.15826106071472, -0.1601986438036, 0.16213457286358, -0.16406840085983, 0.1659996509552, -0.16792783141136, 0.16985248029232, -0.17177310585976, 0.17368921637535, -0.17560034990311, 0.17750599980354, -0.17940567433834, 0.18129889667034, -0.18318516016006, 0.18506400287151, -0.18693490326405, 0.18879736959934, -0.19065092504025, 0.19249506294727, -0.19432929158211, 0.19615311920643, -0.19796605408192, 0.19976760447025, -0.20155727863312, 0.20333458483219, -0.20509901642799, 0.20685011148453, -0.20858737826347, 0.21031031012535, -0.21201846003532, 0.21371130645275, -0.2153884023428, 0.21704925596714, -0.21869339048862, 0.22032034397125, -0.22192965447903, 0.22352084517479, -0.2250934690237, 0.22664704918861, -0.22818115353584, 0.22969530522823, -0.23118908703327, 0.23266205191612, -0.23411375284195, 0.23554377257824, -0.23695167899132, 0.23833703994751, -0.23969945311546, 0.24103850126266, -0.24235378205776, 0.2436448931694, -0.2449114471674, 0.24615305662155, -0.24736933410168, 0.24855990707874, -0.24972441792488, 0.25086250901222, -0.25197380781174, 0.25305795669556, -0.25411465764046, 0.25514355301857, -0.25614434480667, 0.25711667537689, -0.25806024670601, 0.2589747607708, -0.25985994935036, 0.26071551442146, -0.26154118776321, 0.26233667135239, -0.2631017267704, 0.26383611559868, -0.26453956961632, 0.26521188020706, -0.26585280895233, 0.26646217703819, -0.26703971624374, 0.26758527755737, -0.26809868216515, 0.26857972145081, -0.26902824640274, 0.26944410800934, -0.26982712745667, 0.27017721533775, -0.27049419283867, 0.27077800035477, -0.27102848887444, 0.27124556899071, -0.27142918109894, 0.27157920598984, -0.27169561386108, 0.27177831530571, -0.27182728052139, 0.27184250950813, -0.27182391285896, 0.27177155017853, -0.27168533205986, 0.27156534790993, -0.27141156792641, 0.27122402191162, -0.27100276947021, 0.27074784040451, -0.27045929431915, 0.27013722062111, -0.26978167891502, 0.26939278841019, -0.26897060871124, 0.26851525902748, -0.26802688837051, 0.26750561594963, -0.26695156097412, 0.26636493206024, -0.26574581861496, 0.26509445905685, -0.26441100239754, 0.26369562745094, -0.26294857263565, 0.26217001676559, -0.26136019825935, 0.26051935553551, -0.25964772701263, 0.25874555110931, -0.25781309604645, 0.25685060024261, -0.25585839152336, 0.25483673810959, -0.2537859082222, 0.25270625948906, -0.25159806013107, 0.25046163797379, -0.24929735064507, 0.24810549616814, -0.24688646197319, 0.24564057588577, -0.24436821043491, 0.24306973814964, -0.24174551665783, 0.24039596319199, -0.23902145028114, 0.23762238025665, -0.23619915544987, 0.2347521930933, -0.23328191041946, 0.23178873956203, -0.23027311265469, 0.22873546183109, -0.22717623412609, 0.22559589147568, -0.22399486601353, 0.2223736345768, -0.22073265910149, 0.21907241642475, -0.21739336848259, 0.21569600701332, -0.21398082375526, 0.21224829554558, -0.21049891412258, 0.20873318612576, -0.20695160329342, 0.20515467226505, -0.20334289968014, 0.20151679217815, -0.1996768862009, 0.19782365858555, -0.19595766067505, 0.19407938420773, -0.19218936562538, 0.19028814136982, -0.18837620317936, 0.18645411729813, -0.18452237546444, 0.18258152902126, -0.18063209950924, 0.17867460846901, -0.17670959234238, 0.17473758757114, -0.17275913059711, 0.17077471315861, -0.16878490149975, 0.16679021716118, -0.16479116678238, 0.16278830170631, -0.16078212857246, 0.15877316892147, -0.15676195919514, 0.15474900603294, -0.15273483097553, 0.15071994066238, 19910.517578125, 1602.0, 194.0, 0.15037804841995, -0.15236103534698, 0.15434461832047, -0.15632829070091, 0.15831153094769, -0.16029387712479, 0.16227477788925, -0.16425377130508, 0.16623030602932, -0.16820389032364, 0.1701740026474, -0.17214012145996, 0.17410174012184, -0.17605832219124, 0.17800934612751, -0.17995430529118, 0.18189264833927, -0.18382386863232, 0.18574744462967, -0.18766283988953, 0.18956951797009, -0.19146697223186, 0.19335466623306, -0.19523207843304, 0.19709867238998, -0.19895394146442, 0.20079736411572, -0.20262840390205, 0.20444655418396, -0.20625127851963, 0.20804210007191, -0.20981846749783, 0.21157988905907, -0.21332585811615, 0.21505585312843, -0.21676939725876, 0.21846598386765, -0.22014510631561, 0.2218062877655, -0.223449036479, 0.22507286071777, -0.226677313447, 0.22826188802719, -0.22982612252235, 0.23136958479881, -0.23289176821709, 0.23439225554466, -0.2358705997467, 0.23732633888721, -0.23875905573368, 0.24016831815243, -0.24155369400978, 0.24291478097439, -0.2442511767149, 0.24556244909763, -0.24684824049473, 0.24810813367367, -0.24934177100658, 0.25054877996445, -0.25172877311707, 0.25288140773773, -0.2540063560009, 0.25510323047638, -0.25617176294327, 0.2572115957737, -0.25822240114212, 0.25920388102531, -0.26015576720238, 0.26107776165009, -0.26196956634521, 0.26283094286919, -0.26366159319878, 0.26446130871773, -0.26522985100746, 0.26596695184708, -0.26667240262032, 0.26734602451324, -0.26798757910728, 0.26859691739082, -0.2691738307476, 0.26971817016602, -0.2702297270298, 0.27070844173431, -0.2711541056633, 0.27156659960747, -0.27194583415985, 0.27229171991348, -0.27260410785675, 0.27288293838501, -0.27312815189362, 0.27333968877792, -0.27351745963097, 0.27366146445274, -0.27377167344093, 0.27384802699089, -0.27389055490494, 0.27389925718307, -0.2738741338253, 0.27381521463394, -0.27372255921364, 0.27359616756439, -0.27343612909317, 0.27324250340462, -0.27301535010338, 0.27275481820107, -0.2724609375, 0.2721338570118, -0.27177369594574, 0.27138057351112, -0.27095463871956, 0.27049607038498, -0.27000498771667, 0.26948156952858, -0.26892599463463, 0.2683385014534, -0.26771923899651, 0.26706847548485, -0.26638635993004, 0.2656731903553, -0.26492917537689, 0.26415455341339, -0.26334962248802, 0.26251462101936, -0.26164981722832, 0.26075553894043, -0.2598320543766, 0.25887969136238, -0.25789871811867, 0.25688946247101, -0.25585228204727, 0.254787504673, -0.25369548797607, 0.25257652997971, -0.25143104791641, 0.25025939941406, -0.2490619122982, 0.24783901870251, -0.24659107625484, 0.24531848728657, -0.24402165412903, 0.24270099401474, -0.24135689437389, 0.23998980224133, -0.23860011994839, 0.23718829452991, -0.23575474321842, 0.23429991304874, -0.23282425105572, 0.23132820427418, -0.22981223464012, 0.22827678918839, -0.22672232985497, 0.22514933347702, -0.22355826199055, 0.22194960713387, -0.22032381594181, 0.2186813801527, -0.21702279150486, 0.21534852683544, -0.21365907788277, 0.21195493638515, -0.21023659408092, 0.20850452780724, -0.20675925910473, 0.2050012499094, -0.20323103666306, 0.20144909620285, -0.19965595006943, 0.19785206019878, -0.19603794813156, 0.19421412050724, -0.1923810839653, 0.1905393153429, -0.18868932127953, 0.18683160841465, -0.1849666684866, 0.18309500813484, -0.18121710419655, 0.1793334633112, -0.17744459211826, 0.17555095255375, -0.17365305125713, 0.17175137996674, -0.16984640061855, 0.16793861985207, -0.16602848470211, 0.16411650180817, -0.16220313310623, 0.1602888405323, -0.15837408602238, 0.15645936131477, -0.15454508364201, 0.15263172984123, -0.15071974694729, 20493.939453125, 1649.0, 202.0, -0.15089735388756, 0.15271936357021, -0.15454167127609, 0.15636391937733, -0.1581856906414, 0.16000662744045, -0.16182631254196, 0.16364438831806, -0.16546043753624, 0.1672740727663, -0.1690848916769, 0.17089250683784, -0.17269650101662, 0.17449647188187, -0.17629201710224, 0.17808273434639, -0.1798682063818, 0.18164803087711, -0.18342180550098, 0.1851891130209, -0.18694953620434, 0.18870265781879, -0.19044809043407, 0.1921854019165, -0.19391417503357, 0.19563400745392, -0.19734446704388, 0.19904516637325, -0.20073568820953, 0.20241561532021, -0.20408451557159, 0.20574201643467, -0.2073876708746, 0.20902110636234, -0.21064187586308, 0.21224960684776, -0.21384388208389, 0.21542429924011, -0.21699044108391, 0.21854193508625, -0.22007837891579, 0.22159935534, -0.22310449182987, 0.22459338605404, -0.22606566548347, 0.22752092778683, -0.22895880043507, 0.23037891089916, -0.23178087174892, 0.23316432535648, -0.23452888429165, 0.23587419092655, -0.23719988763332, 0.2385056167841, -0.239791020751, 0.24105575680733, -0.24229946732521, 0.2435218244791, -0.24472250044346, 0.24590113759041, -0.24705742299557, 0.24819104373455, -0.24930168688297, 0.25038900971413, -0.25145274400711, 0.25249257683754, -0.25350821018219, 0.25449934601784, -0.25546571612358, 0.2564070224762, -0.2573230266571, 0.25821343064308, -0.25907802581787, 0.25991648435593, -0.26072862744331, 0.26151418685913, -0.2622729241848, 0.26300463080406, -0.26370909810066, 0.2643860578537, -0.26503536105156, 0.26565679907799, -0.26625016331673, 0.26681530475616, -0.26735201478004, 0.26786011457443, -0.26833948493004, 0.26878994703293, -0.26921135187149, 0.26960355043411, -0.26996648311615, 0.27029994130135, -0.27060383558273, 0.27087810635567, -0.27112257480621, 0.27133724093437, -0.27152195572853, 0.27167665958405, -0.27180129289627, 0.27189579606056, -0.2719601392746, 0.27199426293373, -0.27199813723564, 0.27197173237801, -0.27191504836082, 0.2718280851841, -0.2717108130455, 0.27156323194504, -0.27138540148735, 0.27117735147476, -0.27093908190727, 0.27067065238953, -0.27037209272385, 0.27004352211952, -0.26968494057655, 0.26929646730423, -0.26887819170952, 0.26843017339706, -0.26795256137848, 0.26744541525841, -0.26690888404846, 0.26634308695793, -0.26574817299843, 0.26512426137924, -0.26447153091431, 0.26379010081291, -0.26308020949364, 0.26234194636345, -0.26157557964325, 0.26078122854233, -0.25995913147926, 0.25910949707031, -0.25823253393173, 0.25732845067978, -0.25639748573303, 0.25543987751007, -0.2544558942318, 0.25344574451447, -0.2524097263813, 0.25134810805321, -0.25026109814644, 0.24914905428886, -0.24801222980022, 0.24685092270374, -0.24566543102264, 0.24445605278015, -0.24322313070297, 0.24196696281433, -0.24068786203861, 0.23938618600368, -0.23806227743626, 0.23671644926071, -0.23534907400608, 0.23396049439907, -0.23255108296871, 0.23112119734287, -0.22967121005058, 0.22820149362087, -0.22671243548393, 0.22520442306995, -0.22367782890797, 0.22213307023048, -0.2205705344677, 0.21899062395096, -0.21739375591278, 0.21578031778336, -0.21415075659752, 0.21250547468662, -0.21084488928318, 0.20916941761971, -0.20747952163219, 0.205775603652, -0.2040580958128, 0.20232746005058, -0.20058411359787, 0.19882850348949, -0.19706107676029, 0.1952822804451, -0.19349256157875, 0.19169235229492, -0.18988212943077, 0.18806232511997, -0.18623341619968, 0.18439583480358, -0.18255004286766, 0.18069648742676, -0.17883564531803, 0.17696794867516, -0.17509388923645, 0.17321388423443, -0.17132841050625, 0.16943792998791, -0.16754288971424, 0.16564373672009, -0.1637409478426, 0.16183495521545, -0.15992622077465, 0.15801519155502, -0.15610232949257, 0.15418806672096, -0.1522728651762, 0.15035715699196, 21094.458984375, 1698.0, 205.0, 0.15183682739735, -0.15372121334076, 0.15560582280159, -0.15749026834965, 0.15937408804893, -0.16125686466694, 0.16313815116882, -0.16501753032207, 0.1668945401907, -0.16876876354218, 0.17063973844051, -0.17250701785088, 0.17437016963959, -0.17622874677181, 0.17808230221272, -0.17993038892746, 0.18177253007889, -0.18360832333565, 0.18543727695942, -0.18725895881653, 0.18907292187214, -0.19087870419025, 0.1926758736372, -0.19446396827698, 0.19624254107475, -0.19801114499569, 0.19976931810379, -0.20151664316654, 0.20325267314911, -0.20497694611549, 0.20668902993202, -0.20838847756386, 0.21007487177849, -0.21174775063992, 0.21340671181679, -0.21505130827427, 0.21668110787868, -0.21829569339752, 0.21989464759827, -0.22147753834724, 0.22304397821426, -0.22459352016449, 0.22612577676773, -0.22764034569263, 0.22913680970669, -0.23061479628086, 0.2320739030838, -0.23351374268532, 0.23493392765522, -0.23633408546448, 0.23771384358406, -0.23907282948494, 0.24041070044041, -0.24172706902027, 0.24302160739899, -0.24429395794868, 0.24554377794266, -0.24677073955536, 0.24797451496124, -0.24915477633476, 0.25031122565269, -0.25144350528717, 0.25255137681961, -0.25363448262215, 0.2546925842762, -0.25572535395622, 0.25673255324364, -0.25771391391754, 0.25866913795471, -0.25959798693657, 0.26050022244453, -0.26137557625771, 0.26222386956215, -0.26304483413696, 0.26383829116821, -0.264603972435, 0.2653417289257, -0.26605135202408, 0.26673266291618, -0.26738548278809, 0.26800960302353, -0.26860493421555, 0.26917126774788, -0.26970845460892, 0.27021643519402, -0.27069500088692, 0.27114406228065, -0.27156350016594, 0.2719532251358, -0.2723131775856, 0.27264320850372, -0.27294325828552, 0.27321329712868, -0.27345323562622, 0.27366301417351, -0.27384263277054, 0.27399203181267, -0.27411118149757, 0.27420008182526, -0.27425873279572, 0.27428710460663, -0.27428525686264, 0.27425315976143, -0.27419087290764, 0.27409842610359, -0.27397587895393, 0.27382326126099, -0.27364063262939, 0.27342811226845, -0.27318572998047, 0.27291357517242, -0.27261179685593, 0.27228045463562, -0.27191966772079, 0.27152955532074, -0.27111026644707, 0.27066195011139, -0.27018469572067, 0.26967871189117, -0.26914414763451, 0.26858115196228, -0.26798993349075, 0.26737064123154, -0.26672351360321, 0.26604869961739, -0.26534646749496, 0.26461696624756, -0.26386046409607, 0.26307716965675, -0.26226732134819, 0.26143118739128, -0.26056897640228, 0.2596809566021, -0.25876742601395, 0.25782859325409, -0.25686478614807, 0.25587627291679, -0.25486335158348, 0.25382626056671, -0.25276538729668, 0.25168094038963, -0.25057330727577, 0.24944278597832, -0.24828968942165, 0.24711433053017, -0.24591706693172, 0.24469821155071, -0.24345813691616, 0.24219715595245, -0.24091562628746, 0.23961392045021, -0.23829238116741, 0.23695136606693, -0.23559126257896, 0.23421242833138, -0.2328152358532, 0.23140007257462, -0.2299672961235, 0.22851732373238, -0.22705049812794, 0.22556725144386, -0.22406794130802, 0.22255298495293, -0.22102276980877, 0.2194776982069, -0.21791817247868, 0.21634458005428, -0.21475733816624, 0.21315684914589, -0.21154351532459, 0.20991775393486, -0.20827996730804, 0.2066305577755, -0.20496995747089, 0.20329856872559, -0.20161679387093, 0.19992505013943, -0.19822373986244, 0.19651331007481, -0.19479413330555, 0.19306662678719, -0.19133122265339, 0.18958832323551, -0.18783833086491, 0.18608164787292, -0.18431870639324, 0.18254987895489, -0.1807756125927, 0.17899626493454, -0.17721228301525, 0.17542403936386, -0.17363192141056, 0.17183636128902, -0.17003773152828, 0.16823641955853, -0.16643282771111, 0.16462734341621, -0.16282033920288, 0.1610122025013, -0.15920330584049, 0.15739405155182, -0.15558478236198, 0.15377587080002, -0.15196770429611, 0.15016062557697, 21712.572265625, 1746.0, 214.0, 0.15007181465626, -0.15178294479847, 0.15349444746971, -0.15520603954792, 0.15691737830639, -0.15862818062305, 0.16033808887005, -0.16204680502415, 0.1637540012598, -0.16545934975147, 0.16716253757477, -0.16886320710182, 0.17056106030941, -0.17225575447083, 0.17394694685936, -0.17563432455063, 0.17731752991676, -0.17899625003338, 0.18067012727261, -0.18233881890774, 0.18400201201439, -0.18565934896469, 0.18731048703194, -0.18895509839058, 0.19059284031391, -0.19222335517406, 0.19384630024433, -0.19546134769917, 0.19706815481186, -0.19866637885571, 0.20025566220284, -0.2018356770277, 0.2034060806036, -0.20496653020382, 0.20651668310165, -0.20805618166924, 0.20958472788334, -0.21110194921494, 0.21260751783848, -0.21410109102726, 0.21558234095573, -0.21705092489719, 0.21850652992725, -0.21994879841805, 0.22137743234634, -0.22279205918312, 0.22419239580631, -0.22557808458805, 0.22694881260395, -0.22830426692963, 0.22964413464069, -0.23096808791161, 0.23227579891682, -0.23356698453426, 0.2348413169384, -0.236098498106, 0.23733823001385, -0.23856018483639, 0.23976410925388, -0.24094966053963, 0.24211658537388, -0.24326458573341, 0.24439336359501, -0.24550265073776, 0.24659216403961, -0.24766163527966, 0.24871078133583, -0.24973936378956, 0.25074708461761, -0.25173372030258, 0.2526989877224, -0.25364264845848, 0.25456446409225, -0.25546419620514, 0.25634157657623, -0.25719639658928, 0.25802844762802, -0.25883749127388, 0.25962328910828, -0.26038566231728, 0.2611243724823, -0.26183924078941, 0.26253005862236, -0.26319661736488, 0.26383876800537, -0.26445633172989, 0.26504907011986, -0.26561689376831, 0.26615956425667, -0.26667696237564, 0.26716893911362, -0.26763534545898, 0.26807603240013, -0.26849085092545, 0.26887968182564, -0.26924240589142, 0.26957893371582, -0.26988908648491, 0.27017283439636, -0.27043002843857, 0.27066057920456, -0.27086442708969, 0.271041482687, -0.27119165658951, 0.27131488919258, -0.27141115069389, 0.27148035168648, -0.27152246236801, 0.27153745293617, -0.27152526378632, 0.27148589491844, -0.27141931653023, 0.27132549881935, -0.27120447158813, 0.27105623483658, -0.27088075876236, 0.2706780731678, -0.27044823765755, 0.27019122242928, -0.26990711688995, 0.2695959508419, -0.26925775408745, 0.26889258623123, -0.26850053668022, 0.26808166503906, -0.2676360309124, 0.26716375350952, -0.26666489243507, 0.26613956689835, -0.26558789610863, 0.26500996947289, -0.26440590620041, 0.26377588510513, -0.2631199657917, 0.26243832707405, -0.26173111796379, 0.26099851727486, -0.26024064421654, 0.25945767760277, -0.2586498260498, 0.25781723856926, -0.25696012377739, 0.25607866048813, -0.25517305731773, 0.25424355268478, -0.25329032540321, 0.2523136138916, -0.25131365656853, 0.25029069185257, -0.24924494326115, 0.24817667901516, -0.24708613753319, 0.24597358703613, -0.2448392957449, 0.2436835616827, -0.24250662326813, 0.24130879342556, -0.24009037017822, 0.23885163664818, -0.23759289085865, 0.23631446063519, -0.23501665890217, 0.23369981348515, -0.23236422240734, 0.23101024329662, -0.2296382188797, 0.22824847698212, -0.22684136033058, 0.22541724145412, -0.22397646307945, 0.2225193977356, -0.22104641795158, 0.21955789625645, -0.21805419027805, 0.21653570234776, -0.21500281989574, 0.21345591545105, -0.21189540624619, 0.2103216946125, -0.20873515307903, 0.20713621377945, -0.20552529394627, 0.20390279591084, -0.20226913690567, 0.20062474906445, -0.19897004961967, 0.19730547070503, -0.19563145935535, 0.19394841790199, -0.19225680828094, 0.19055707752705, -0.18884965777397, 0.18713499605656, -0.18541353940964, 0.18368574976921, -0.18195205926895, 0.18021295964718, -0.17846886813641, 0.17672026157379, -0.17496761679649, 0.17321138083935, -0.17145201563835, 0.1696899831295, -0.16792576014996, 0.16615982353687, -0.16439262032509, 0.16262464225292, -0.16085633635521, 0.15908817946911, -0.15732066333294, 0.15555423498154, -0.15378937125206, 0.15202654898167, -0.15026624500751, 22348.80078125, 1799.0, 248.0, -0.1515397131443, 0.15329277515411, -0.15504582226276, 0.15679849684238, -0.15855044126511, 0.16030129790306, -0.16205069422722, 0.16379827260971, -0.16554366052151, 0.16728648543358, -0.16902638971806, 0.17076298594475, -0.17249593138695, 0.17422483861446, -0.17594933509827, 0.17766906321049, -0.17938362061977, 0.18109267950058, -0.18279582262039, 0.1844927072525, -0.18618296086788, 0.1878662109375, -0.18954207003117, 0.19121019542217, -0.19287019968033, 0.19452172517776, -0.19616439938545, 0.19779786467552, -0.1994217634201, 0.20103572309017, -0.20263938605785, 0.20423239469528, -0.20581440627575, 0.20738504827023, -0.208943977952, 0.21049086749554, -0.21202532947063, 0.21354706585407, -0.21505570411682, 0.21655091643333, -0.21803237497807, 0.21949975192547, -0.22095271945, 0.2223909497261, -0.22381412982941, 0.22522194683552, -0.22661407291889, 0.22799022495747, -0.22935007512569, 0.23069335520267, -0.23201973736286, 0.23332896828651, -0.23462073504925, 0.23589478433132, -0.23715081810951, 0.23838858306408, -0.23960781097412, 0.2408082485199, -0.24198962748051, 0.24315172433853, -0.24429428577423, 0.24541708827019, -0.24651987850666, 0.24760244786739, -0.24866458773613, 0.24970607459545, -0.2507266998291, 0.25172629952431, -0.25270462036133, 0.25366154313087, -0.25459685921669, 0.25551041960716, -0.25640201568604, 0.25727152824402, -0.25811877846718, 0.25894367694855, -0.25974601507187, 0.2605257332325, -0.26128268241882, 0.26201674342155, -0.2627277970314, 0.26341578364372, -0.26408058404922, 0.26472210884094, -0.26534032821655, 0.26593512296677, -0.26650643348694, 0.26705425977707, -0.26757851243019, 0.2680791914463, -0.26855623722076, 0.26900961995125, -0.26943936944008, 0.26984542608261, -0.27022784948349, 0.27058663964272, -0.27092176675797, 0.27123332023621, -0.27152132987976, 0.27178579568863, -0.27202680706978, 0.27224442362785, -0.27243867516518, 0.27260968089104, -0.2727575302124, 0.27288225293159, -0.27298402786255, 0.27306291460991, -0.27311903238297, 0.27315253019333, -0.27316349744797, 0.27315211296082, -0.27311852574348, 0.27306285500526, -0.27298530936241, 0.27288600802422, -0.27276515960693, 0.2726229429245, -0.27245956659317, 0.27227520942688, -0.27207008004189, 0.27184438705444, -0.27159836888313, 0.27133226394653, -0.2710462808609, 0.27074068784714, -0.2704156935215, 0.27007159590721, -0.26970866322517, 0.26932713389397, -0.26892727613449, 0.26850941777229, -0.26807379722595, 0.26762074232101, -0.2671505510807, 0.26666352152824, -0.26615995168686, 0.2656401693821, -0.26510453224182, 0.26455330848694, -0.26398688554764, 0.26340556144714, -0.26280972361565, 0.26219967007637, -0.26157581806183, 0.26093846559525, -0.26028800010681, 0.2596247792244, -0.25894919037819, 0.25826162099838, -0.25756242871284, 0.25685197114944, -0.25613069534302, 0.25539895892143, -0.25465714931488, 0.25390565395355, -0.25314491987228, 0.25237530469894, -0.25159722566605, 0.2508111000061, -0.25001734495163, 0.24921633303165, -0.24840851128101, 0.24759429693222, -0.24677410721779, 0.24594834446907, -0.24511744081974, 0.24428181350231, -0.2434418797493, 0.24259808659554, -0.24175083637238, 0.24090057611465, -0.24004769325256, 0.2391926497221, -0.23833584785461, 0.23747771978378, -0.23661869764328, 0.23575919866562, -0.23489965498447, 0.2340404689312, -0.23318207263947, 0.23232488334179, -0.23146933317184, 0.23061582446098, -0.22976477444172, 0.22891660034657, -0.22807171940804, 0.22723053395748, -0.22639343142509, 0.22556085884571, -0.2247331738472, 0.22391080856323, -0.22309413552284, 0.22228354215622, -0.22147944569588, 0.22068220376968, -0.21989221870899, 0.21910984814167, -0.21833546459675, 0.21756945550442, -0.21681217849255, 0.216063991189, -0.2153252363205, 0.21459628641605, -0.21387746930122, 0.21316914260387, -0.21247161924839, 0.21178524196148, -0.21111033856869, 0.2104472219944, -0.209796205163, 0.20915760099888, -0.20853169262409, 0.20791880786419, -0.20731918513775, 0.20673315227032, -0.20616096258163, 0.20560289919376, -0.20505920052528, 0.2045301347971, -0.20401595532894, 0.20351688563824, -0.20303317904472, 0.20256505906582, -0.20211273431778, 0.20167641341686, -0.20125631988049, 0.20085263252258, -0.20046554505825, 0.20009523630142, -0.19974188506603, 0.19940565526485, -0.1990866959095, 0.19878517091274, -0.19850119948387, 0.1982349306345, -0.19798648357391, 0.19775596261024, -0.19754350185394, 0.19734917581081, -0.19717307388783, 0.1970153003931, -0.1968759149313, 0.19675497710705, -0.196652546525, 0.1965686827898, -0.19650341570377, 0.19645677506924, 23003.669921875, 1854.0, 193.0, 0.15126165747643, -0.15303590893745, 0.15481439232826, -0.15659692883492, 0.15838330984116, -0.16017335653305, 0.16196689009666, -0.16376368701458, 0.16556358337402, -0.16736637055874, 0.16917185485363, -0.17097985744476, 0.17279016971588, -0.17460259795189, 0.17641696333885, -0.17823304235935, 0.18005067110062, -0.18186964094639, 0.18368975818157, -0.18551081418991, 0.18733264505863, -0.18915502727032, 0.19097776710987, -0.19280068576336, 0.19462358951569, -0.1964462697506, 0.19826853275299, -0.20009019970894, 0.20191106200218, -0.20373094081879, 0.2055496275425, -0.20736694335938, 0.20918269455433, -0.21099670231342, 0.21280874311924, -0.21461865305901, 0.21642625331879, -0.21823132038116, 0.22003370523453, -0.22183319926262, 0.2236296236515, -0.22542278468609, 0.2272125184536, -0.22899863123894, 0.23078092932701, -0.23255926370621, 0.23433341085911, -0.23610323667526, 0.23786853253841, -0.23962914943695, 0.24138489365578, -0.24313558638096, 0.24488106369972, -0.2466211616993, 0.2483557164669, -0.25008451938629, 0.25180745124817, -0.2535243332386, 0.25523498654366, -0.25693926215172, 0.25863698124886, -0.26032799482346, 0.26201215386391, -0.26368927955627, 0.26535925269127, -0.26702189445496, 0.26867705583572, -0.27032455801964, 0.27196431159973, -0.27359613776207, 0.27521988749504, -0.27683541178703, 0.27844256162643, -0.28004124760628, 0.28163126111031, -0.28321251273155, 0.2847848534584, -0.28634816408157, 0.28790226578712, -0.28944709897041, 0.29098245501518, -0.29250827431679, 0.29402440786362, -0.29553070664406, 0.29702708125114, -0.29851341247559, 0.29998955130577, -0.30145543813705, 0.3029108941555, -0.30435582995415, 0.30579015612602, -0.30721375346184, 0.3086265027523, -0.31002828478813, 0.31141903996468, -0.31279861927032, 0.31416696310043, -0.31552395224571, 0.31686949729919, -0.31820347905159, 0.31952583789825, -0.3208364546299, 0.32213526964188, -0.3234221637249, 0.324697047472, -0.32595989108086, 0.32721054553986, -0.32844895124435, 0.32967504858971, -0.33088871836662, 0.33208993077278, -0.33327856659889, 0.33445459604263, -0.33561792969704, 0.33676847815514, -0.33790621161461, 0.33903101086617, -0.34014284610748, 0.34124165773392, -0.3423273563385, 0.34339991211891, -0.34445923566818, 0.34550526738167, -0.34653797745705, 0.34755730628967, -0.3485631942749, 0.34955558180809, -0.35053440928459, 0.35149964690208, -0.35245123505592, 0.35338914394379, -0.35431331396103, 0.35522368550301, -0.3561202287674, 0.35700288414955, -0.35787165164948, 0.3587264418602, -0.35956728458405, 0.36039406061172, -0.36120676994324, 0.36200538277626, -0.36278986930847, 0.36356019973755, -0.36431631445885, 0.36505818367004, -0.36578580737114, 0.36649912595749, -0.36719813942909, 0.3678827881813, -0.3685530424118, 0.36920893192291, -0.36985039710999, 0.37047737836838, -0.37108990550041, 0.37168794870377, -0.37227144837379, 0.37284043431282, -0.3733948469162, 0.37393468618393, -0.37445995211601, 0.3749705851078, -0.3754665851593, 0.37594795227051, -0.37641462683678, 0.37686666846275, -0.37730398774147, 0.37772661447525, -0.37813451886177, 0.37852770090103, -0.37890613079071, 0.37926980853081, -0.379618704319, 0.37995284795761, -0.38027220964432, 0.3805767595768, -0.38086652755737, 0.3811414539814, -0.38140159845352, 0.38164690136909, -0.38187736272812, 0.38209298253059, -0.38229376077652, 0.3824796974659, -0.3826507627964, 0.38280698657036, -0.38294830918312, 0.38307479023933, -0.38318639993668, 0.38328313827515, -0.38336500525475, 0.38343197107315, -0.38348406553268, 0.38352128863335, 23677.728515625, 1883.0, 164.0, -0.15149533748627, 0.15402349829674, -0.15657162666321, 0.15913946926594, -0.16172678768635, 0.1643333286047, -0.16695883870125, 0.1696030497551, -0.17226569354534, 0.17494650185108, -0.17764516174793, 0.18036140501499, -0.18309491872787, 0.1858453899622, -0.18861252069473, 0.1913959980011, -0.19419546425343, 0.19701062142849, -0.19984109699726, 0.20268656313419, -0.20554666221142, 0.20842103660107, -0.21130932867527, 0.21421113610268, -0.21712611615658, 0.22005386650562, -0.22299398481846, 0.22594609856606, -0.22890977561474, 0.23188464343548, -0.23487025499344, 0.23786620795727, -0.24087207019329, 0.24388740956783, -0.24691179394722, 0.24994479119778, -0.25298592448235, 0.25603476166725, -0.2590908408165, 0.26215371489525, -0.26522287726402, 0.26829788088799, -0.2713782787323, 0.27446353435516, -0.27755317091942, 0.28064674139023, -0.28374370932579, 0.28684362769127, -0.28994593024254, 0.29305014014244, -0.2961557507515, 0.29926225543022, -0.30236911773682, 0.3054758310318, -0.30858185887337, 0.31168669462204, -0.31478980183601, 0.31789067387581, -0.3209887444973, 0.32408344745636, -0.32717433571815, 0.33026078343391, -0.33334228396416, 0.33641827106476, -0.33948823809624, 0.34255161881447, -0.34560784697533, 0.34865638613701, -0.35169667005539, 0.35472816228867, -0.35775029659271, 0.36076253652573, -0.36376428604126, 0.36675503849983, -0.36973422765732, 0.37270125746727, -0.37565562129021, 0.378596752882, -0.38152408599854, 0.38443705439568, -0.38733512163162, 0.39021772146225, -0.39308431744576, 0.39593434333801, -0.39876726269722, 0.40158253908157, -0.40437957644463, 0.40715789794922, -0.40991687774658, 0.41265606880188, -0.41537484526634, 0.41807273030281, -0.42074915766716, 0.42340362071991, -0.42603558301926, 0.4286445081234, -0.43122985959053, 0.4337911605835, -0.43632790446281, 0.43883952498436, -0.44132554531097, 0.44378542900085, -0.44621875882149, 0.44862493872643, -0.45100355148315, 0.45335409045219, -0.45567604899406, 0.45796898007393, -0.46023237705231, 0.46246582269669, -0.46466884016991, 0.46684092283249, -0.46898168325424, 0.47109067440033, -0.47316738963127, 0.4752114713192, -0.47722247242928, 0.47919994592667, -0.48114347457886, 0.48305270075798, -0.4849271774292, 0.48676651716232, -0.48857036232948, 0.49033829569817, -0.49206992983818, 0.4937649667263, -0.4954229593277, 0.49704363942146, -0.49862658977509, 0.50017154216766, -0.50167804956436, 0.50314593315125, -0.50457483530045, 0.50596439838409, -0.50731432437897, 0.50862443447113, -0.50989431142807, 0.51112371683121, -0.51231247186661, 0.5134602189064, -0.51456677913666, 0.51563185453415, -0.51665526628494, 0.51763677597046, -0.51857614517212, 0.51947319507599, -0.52032774686813, 0.52113956212997, -0.52190858125687, 0.52263444662094, -0.52331721782684, 0.5239565372467, -0.52455246448517, 0.52510470151901, -0.52561324834824, 0.52607792615891, -0.52649867534637, 0.52687531709671, -0.52720791101456, 0.52749627828598, -0.52774035930634, 0.52794021368027, -0.52809566259384, 0.52820670604706
        
    ];

    
    
    self.setup(sampleRate);

    
    
}


//(c) Nick Collins 2019
//De Cheveigné, A. and Kawahara, H., 2002. YIN, a fundamental frequency estimator for speech and music. The Journal of the Acoustical Society of America, 111(4), pp.1917-1930.

//could make version updated every sample, with maxtau delay lines
//and recursive update (remove previous value, add new squared difference each sample step, occasional full recalculation to avoid accumulating numerical errors)
//however only want one output per block, not one per sample

//inefficient if calculated naively over all tau and full window size (70-85% CPU)
//reduce search range between minimum and maximum periods
//cache calculations per block, only update for new block (down to around 25% CPU)


function MMLLYin(sampleRate,blocksize,minFreq=65,maxFreq=1700) {
    
    var self = this; 
    
self.setup = function(sampleRate) {
	var i;
 
    self.m_srate = sampleRate;
    self.blocksize = blocksize;
    
	self.m_minfreq = minFreq; //30; //ZIN0(5);
	self.m_maxfreq = maxFreq; //2000; //ZIN0(6);
	
    self.maxtau = Math.floor(sampleRate/minFreq);
    self.mintau = Math.floor(sampleRate/maxFreq);
    
    self.differencefunction = new Array(self.maxtau+1); //so can use tau as index into array
    
    //"cumulative mean normalized difference function"
    self.differencedashfunction = new Array(self.maxtau+1); //so can use tau as index into array
    
    self.numcaches = Math.ceil(self.maxtau/self.blocksize);
    self.samplestoresize = self.numcaches * self.blocksize;
    self.caches = new Array(self.numcaches);
    self.cachepos = 0;
    
    
    self.numtau = self.maxtau -self.mintau + 1;
    
    for(i=0; i<self.numcaches; ++i) {
        self.caches[i] = new Array(self.numtau);
        
        for(j=0; j<self.blocksize; ++j)
            self.caches[i][j] = 0;
    }
    
    
    //make sure at least twice size of maxtau
    //self.movingwindow = new MMLLwindowing(2*self.maxtau,blocksize);
    
    self.movingwindow = new MMLLwindowing(self.maxtau + self.samplestoresize,blocksize);
    
    //self.previoussamples = new Float32Array(maxtau);

    self.threshold = 0.1;
    
    self.m_midipitch = 69;
	self.m_currfreq=440;
	self.m_hasfreq=0;
    
}

self.setup(sampleRate);
    

self.next = function(input) {

    var i,j;
    var sum,diff;
    var startindex;
    var n = input.length;

    //check threshold using powers
    var ampthresh = 0.01;
    
    var ampok = false;
    
    for (j = 0; j < n; ++j) {
        if (Math.abs(input[j]) >= ampthresh) {
            ampok = true;
            break;
        }
    }
    
    if(ampok) {
        self.m_hasfreq = 1;
    }	else {self.m_hasfreq = 0;}
    

    
    var ready = self.movingwindow.next(input);
    
    if(ready) {
    
        //most recent at later parts of this window of data
        var x = self.movingwindow.store;
        
        //update cache
        
        self.caches[i]
        
        //over each lag
        for(i=self.mintau; i<=self.maxtau;++i) {
            
            sum = 0;
            
            startindex = x.length - self.blocksize - i;
            
            //sum differences
            for(j=0; j<self.blocksize;++j) {
                
                diff = x[startindex+j]-x[startindex+j+i];
                
                sum += diff*diff;
                
            }
            
            self.caches[self.cachepos][i] = sum;
            
        }

        
        for(i=self.mintau; i<=self.maxtau;++i) {
            
            sum = 0.0;
            
            for(j=0; j<self.numcaches;++j) {
                
                sum += self.caches[j][i];
            }
            
            self.differencefunction[i] = sum;
        }
        
        
        self.cachepos = (self.cachepos+1)%(self.numcaches);
        
        
//        
//        //over each lag
//        for(i=self.mintau; i<=self.maxtau;++i) {
//            
//            sum = 0;
//            
//            startindex = x.length - self.maxtau - i;
//            
//            //sum differences
//            for(j=0; j<self.maxtau;++j) {
//            
//                diff = x[startindex+j]-x[startindex+j+i];
//                
//                sum += diff*diff;
//                
//            }
//            
//            self.differencefunction[i] = sum;
//            
//        }
//        
        
        sum = 0;
        
        //step 3 : Cumulative mean normalized difference function
        for(i=self.mintau; i<=self.maxtau;++i) {
            
            sum += self.differencefunction[i];
            
            self.differencedashfunction[i] = i * self.differencefunction[i]/sum;
        }
        
        
        
        var winner = -1;
        //step 4: threshold
        for(i=self.mintau; i<=self.maxtau;++i) {
            
            if(self.differencedashfunction[i]<self.threshold) {
                
                winner = i;
                break;
                
            }
        }
        
        
        if(winner>(-1)) {
            
            //step 5: parabolic interpolation, using differencefunction, not differencedashfunction
            //only works if neighbours exist, so 1<winner<self.maxtau
            
            var refinedestimate = winner;
            
            if((winner>1) && (winner<self.maxtau)) {
            
            var prev = self.differencefunction[winner-1];
            var next = self.differencefunction[winner+1];
            var now = self.differencefunction[winner];
            
            var temp = (2*now)-prev-next;
            
            if (Math.abs(temp)>0.00001) {
                
                refinedestimate += (0.5*(next-prev)/temp);
                
            } else {
                //degenerate straight line case
                
                //may as well take centre
                
                //so do nothing
                
            }
            
            
            }
            
            
            //step 6 "shop around" in local time window
            
            //requires keeping previous differencedashfunction arrays
            
            //leave for now
            
            
            self.m_currfreq = self.m_srate/refinedestimate;
            
            self.m_midipitch = (Math.log2(self.m_currfreq/440) * 12) + 69; //(((log2(m_currfreq/440.0)) * 12) + 69); //as MIDI notes
            
           
            
            
        } else {
            self.m_hasfreq = 0;
        }
        
        
        
    }
    
    return self.m_currfreq; //m_midipitch;
    
  }


    

    
}


//Nick Collins first created 8th June 2018

//support mono and stereo
//asynchronous loading, with function to call upon completion passed in

//shared between Sampler and MMLLWebAudioSetup
function MMLLInputAudio(blocksize)
{
    var self = this;
    
	self.monoinput = new Float32Array(blocksize);
	self.inputL = new Float32Array(blocksize);
	self.inputR = new Float32Array(blocksize);
    self.numChannels = 1;
}
function MMLLOutputAudio(blocksize)
{
    var self = this;
    
	self.outputL = new Float32Array(blocksize);
	self.outputR = new Float32Array(blocksize);
}


//no longer uses interleaved audio if multiple channels
function MMLLBuffer() {
    
    var self = this;
    
    self.dataL = 0;
    self.dataR = 0;
    self.length = 0;
    self.duration = 0;
    self.sampleRate = 44100.0;
    self.numChannels = 1; //unless otherwise

    
}


//contains state for block by block playback of a mono OR stereo buffer object
function MMLLSamplePlayer() {
    
    var self = this;
    
    self.buffer = 0;
    self.playbackposition = 0;
    self.lengthinsampleframes = 0;
    self.numChannels  = 1;
    self.playing = 0;
    self.offset = 0;
    
    //mix settings for pan and amplitude come later? //to a stereo output bus
    //self.amp = 0.4;
    //self.pan = 0.0;
 
    
    self.reset = function(buffer) {
        
        if(buffer!= null) {
            self.buffer = buffer;
            
            self.lengthinsampleframes = buffer.length;
            
            self.numChannels = buffer.numChannels;
        }
        
        self.playbackposition = 0;
        self.playing = 1;
        
    }
    
    //offset code should abstract out to superclass Player
    
    
    //CHECK FOR STEREO COMPATIBILITY
    
    //arrayL, arrayR not stereo rendering
    self.render = function(inputaudio, numSamples) {
        
        var i;
        
        var samplesleft = self.lengthinsampleframes - self.playbackposition; //self.buffer.length;
        
        var datasource,datasource2; // = self.buffer.data;
        
        var offset = self.offset;
        
        var baseindex, sourceinde
        
        //must make copy else changing original reference and messing up rendering for other active events?
        //actually, probably OK, but will keep self way while debugging an issue right now
        var numsamplesnow = numSamples;
        
        numsamplesnow -= offset;
        
        var samplestodo = numsamplesnow;

        if(numsamplesnow>samplesleft) {
            samplestodo = samplesleft;
             self.playing = 0;
        }
        
        var pos = self.playbackposition;
        
        var outputL = inputaudio.inputL;
        var outputR = inputaudio.inputR;
        var monooutput = inputaudio.monoinput;
        
        
        var temp;
        if(offset>0) {
            
            if(self.numChannels ==1) {
            
                datasource = self.buffer.dataL;
                
            for (i = 0; i < samplestodo; ++i) {
                
                temp = datasource[pos+i];
                outputL[offset+i] += temp; //pos will be zero here since only use offset on first block, however keep code as is in case later have playback of sample starting in middle etc
                
                outputR[offset+i] += temp;
                
                monooutput[offset+i] = temp;
            }
                
            } else {
                
                datasource = self.buffer.dataL;
                datasource2 = self.buffer.dataR;
                
                for (i = 0; i < samplestodo; ++i) {
                    temp = offset+i;
                    outputL[temp] += datasource[pos+i];
                    outputR[temp] += datasource2[pos+i];
                    
                    monooutput[offset+i] = (outputL[temp] + outputR[temp])*0.5;
                }
                
//                for (i = 0; i < samplestodo; ++i) {
//                    baseindex = 2*(offset+i);
//                    sourceindex = 2*(pos+i);
//                    
//                    array[baseindex] += datasource[sourceindex];
//                    array[baseindex+1] += datasource[sourceindex+1];
//                    
//                    
//                    //pos will be zero here since only use offset on first block, however keep code as is in case later have playback of sample starting in middle etc
//                }
                
            }
            
            //only active in first block rendered
            self.offset = 0;
            
        } else
        {
            
            if(self.numChannels ==1) {
                
                datasource = self.buffer.dataL;
                
               
                for (i = 0; i < samplestodo; ++i) {
                    
                    temp = datasource[pos+i];
                    
                    outputL[i] += temp; //pos will be zero here since only use offset on first block, however keep code as is in case later have playback of sample starting in middle etc
                    
                    outputR[i] += temp;
                    
                    monooutput[i] +=temp;
                }
                
                
                
//            for (i = 0; i < samplestodo; ++i) {
//                array[i] += datasource[pos+i];
//            }
                
            } else {
                
                datasource = self.buffer.dataL;
                datasource2 = self.buffer.dataR;
                
                for (i = 0; i < samplestodo; ++i) {
                    outputL[i] += datasource[pos+i];
                    outputR[i] += datasource2[pos+i];
                    
                    monooutput[i] = (outputL[i] + outputR[i]) * 0.5; 
                }
                
//                for (i = 0; i < samplestodo; ++i) {
//                    baseindex = 2*i;
//                    sourceindex = 2*(pos+i);
//                    
//                    array[baseindex] += datasource[sourceindex];
//                    array[baseindex+1] += datasource[sourceindex+1];
//                
//                }
                
            }
            
            
            
        }
        
        self.playbackposition += samplestodo;
        
       
        
    }
    
    
    
}



function MMLLSampler() {
    
    //https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
    var self = this;
    
    self.loadcounter = 0;
    self.buffers = 0;
    
    self.loadSamples = function(arrayofpaths, onloadfunction, audiocontext) {
        
        self.numbuffers = arrayofpaths.length;
        
        self.buffers = new Array(self.numbuffers);
        
        for(var i=0; i<arrayofpaths.length; ++i) {
            
            var nowtoload = arrayofpaths[i];
            
            console.log(typeof(nowtoload),nowtoload);
            
            if(typeof(nowtoload)==='string') {
            
            self.loadSample(nowtoload,onloadfunction,i,audiocontext);
                
            } else {
                
            self.loadSample2(nowtoload,onloadfunction,i,audiocontext);
                
            }
            
        }
        
    }
    
    
    
 
    
    self.loadSample2 = function(fileobject,onloadfunction,index,audiocontext) {
     
        
        //http://composerprogrammer.com/music/demo1.mp3
        
        
        var reader = new FileReader();
        
        reader.onload = function(e) {
            
            var audioData = reader.result;
            audiocontext.decodeAudioData(audioData, function(buf) {
                                         //assume only playback one channel, raw format probably interleaved sample frames
                                         
                                         var buffernow = new MMLLBuffer();
                                         
                                         //can get interleaved? Or should already split?
                                         //for machine listening will want in mono
                                         
                                         
                                         buffernow.numChannels = buf.numberOfChannels;
                                         
                                         //at most STEREO
                                         if(buffernow.numChannels>2) buffernow.numChannels = 2;
                                         
                                         buffernow.length = buf.length;
                                         buffernow.duration = buf.duration;
                                         buffernow.sampleRate = buf.sampleRate;
                                         
                                         if(buffernow.numChannels==1) {
                                         
                                         buffernow.dataL = buf.getChannelData(0); //assuming mono
                                         //https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
                                         
                                         } else {
                                         
                                         //assumes 2 channels
                                         //get stereo arrays then interleave into one
                                         
                                         buffernow.dataL = buf.getChannelData(0);
                                         buffernow.dataR = buf.getChannelData(1);
                                         
//                                         var channelL = buf.getChannelData(0);
//                                         var channelR = buf.getChannelData(1);
//                                         
//                                         buffernow.data = new Array(buffernow.length*2);
//                                         
//                                         var where;
//                                         
//                                         for(var k = 0; k<buffernow.length; ++k) {
//                                         
//                                         where = 2*k;
//                                         
//                                         buffernow.data[where] = channelL[k];
//                                         buffernow.data[where+1] = channelR[k];
//                                         
                                         
                                         //}
                                         
                                         
                                         }
                                         
                                       
                                         //console.log('buffer loaded test 1',self,self,self.loadcounter,filename,buf.length,buf.duration, buf.sampleRate); //print
                                         
                                         
                                         //console.log('buffer loaded test 2',self.loadcounter,filename,buffernow.length,buffernow.sampleRate,self.buffers); //print
                                         
                                         self.buffers[index] = buffernow;
                                         
                                         //console.log('buffer loaded',self.loadcounter,filename,buffernow.length,buffernow.samplerate); //print
                                         
                                         
                                         ++(self.loadcounter);
                                         
                                         if(self.loadcounter==self.numbuffers) {
                                         
                                         onloadfunction();
                                         }
                                         
                                         
                                         },
                                         function(e){"Error with decoding audio data" + e.err});
        }
        
        reader.readAsArrayBuffer(fileobject);
        
        
        
    }
    
    
    self.loadSample = function(filename,onloadfunction,index,audiocontext) {
        
        var request = new XMLHttpRequest();
 
        //var filename = "loop"+which+".wav";
        
        
        //http://composerprogrammer.com/music/demo1.mp3
        request.open('GET', filename, true); //viper.ogg
        request.responseType = 'arraybuffer';
     
        
        request.onload = function() {
            var audioData = request.response;
            audiocontext.decodeAudioData(audioData, function(buf) {
                                         //assume only playback one channel, raw format probably interleaved sample frames
                                         
                                         var buffernow = new MMLLBuffer();
                                         
                                         
                                         
                                         
                                         
                                         buffernow.numChannels = buf.numberOfChannels;
                                         
                                         //at most STEREO
                                         if(buffernow.numChannels>2) buffernow.numChannels = 2;
                                         
                                         buffernow.length = buf.length;
                                         buffernow.duration = buf.duration;
                                         buffernow.sampleRate = buf.sampleRate;
                                         
                                         if(buffernow.numChannels==1) {
                                         
                                         buffernow.dataL = buf.getChannelData(0); //assuming mono
                                         //https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
                                         
                                         } else {
                                         
                                         //assumes 2 channels
                                         //get stereo arrays then interleave into one
                                         buffernow.dataL = buf.getChannelData(0);
                                         buffernow.dataR = buf.getChannelData(1);
                                         
//                                         var channelL = buf.getChannelData(0);
//                                         var channelR = buf.getChannelData(1);
//                                         
//                                         buffernow.data = new Array(buffernow.length*2);
//                                         
//                                         var where;
//                                         
//                                         for(var k = 0; k<buffernow.length; ++k) {
//                                         
//                                         where = 2*k;
//                                         
//                                         buffernow.data[where] = channelL[k];
//                                         buffernow.data[where+1] = channelR[k];
//                                         
//                                         
//                                         }
                                         
                                         
                                         }
                                         
                                         
                                         
//                                         buffernow.data = buf.getChannelData(0); //left only, o/w assuming mono
//                                         //https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
//                                         buffernow.length = buf.length;
//                                         buffernow.duration = buf.duration;
//                                         buffernow.sampleRate = buf.sampleRate;
//                                         
//                                          //console.log('buffer loaded test 1',self,self,self.loadcounter,filename,buf.length,buf.duration, buf.sampleRate); //print
                                         
                                         
                                         //console.log('buffer loaded test 2',self.loadcounter,filename,buffernow.length,buffernow.sampleRate,self.buffers); //print
                                         
                                         self.buffers[index] = buffernow;
                                         
                                         //console.log('buffer loaded',self.loadcounter,filename,buffernow.length,buffernow.samplerate); //print
                                         
                                         
                                         ++(self.loadcounter);
                                         
                                         if(self.loadcounter==self.numbuffers) {
                                         
                                            onloadfunction();
                                         }
                                         
                                         
                                         },
                                         function(e){"Error with decoding audio data" + e.err});
        }
        request.send();
        
        
        
    }
    

    
}

//for non-realtime feature extraction with MMLL Listeners
//adapts framework of MMLLWebAudioSetup but without need for Web Audio API

//blocksize will determine how often feature values are stored

//returns an array of features, given a sound file to analyse

//Sample rates for sound files must match that assumed in overall code, no sample rate conversion is carried out

function MMLLFeatureExtractor(featurestoextract, blocksize=1024,sampleRate=44100) {
 
    var self = this;
    
    //self.filenames = filenames;
    
    //Parse and replace any single string by array containing string, so consistent if additional arguments were passed in
    for (var i =0; i< featurestoextract.length; ++i) {
        
        if(!(Array.isArray(featurestoextract[i])) ) {
            
            featurestoextract[i] = [featurestoextract[i]];
            
        }
        
    }
    
   self.featurestoextract = featurestoextract;
    
    self.audioblocksize = blocksize;
    self.inputAudio = new MMLLInputAudio(self.audioblocksize);
  
    self.sampleRate = sampleRate;

    self.numInputChannels = 1;
 
    //context required for sampler's decodeAudioData calls
    
    //can request specific sample rate, but leaving as device's default for now
    //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext
    try {
        self.audiocontext = new webkitAudioContext();
        
    } catch (e) {
        
        try {
            
            self.audiocontext = new AudioContext();
            
        } catch(e) {
            
            alert("Your browser does not support Web Audio API!");
            return;
        }
        
    }
    
    //ignore sampleRate of audiocontext for now, just running through sound files at rate set by user
    //self.sampleRate = self.audiocontext.sampleRate; //usually 44100.0
    //console.log("AudioContext established with sample rate:",self.sampleRate," and now setting up for input type:",self.inputtype); //print
  
    
    //use async, wait?
    self.analyseAudioFile = function(filename,updatefunction) {
        
       
        var featuredata;
        
        self.sampler = new MMLLSampler();
        
        
        return new Promise(function(resolve, reject) {
        //"/sounds/05_radiohead_killer_cars.wav"
        self.sampler.loadSamples([filename],
                                 function onload() {
                                 
                                 console.log('loaded: ',filename);
                                 
                                 self.sampleplayer = new MMLLSamplePlayer();
                                 self.sampleplayer.reset(self.sampler.buffers[0]);
                                 //self.sampleplayer.numChannels = self.sampler.buffers[0]
                                 
                                 if(self.sampleplayer.numChannels>1) {
                                 //interleaved input
                                 self.numInputChannels = 2;
                                 
                                 self.inputAudio.numChannels = self.numInputChannels;
                                 //self.samplearray = new Float32Array(2*audioblocksize);
                                 
                                 }
                                 
                                 //samplearray depends on number of Channels whether interleaved
                                 
                                 //include last frame, will be zero padded as needed
                                 var numblocks = Math.ceil(self.sampleplayer.lengthinsampleframes/self.audioblocksize);
                                 
                                 
                                 //self.processSoundFile(self.audioblocksize);
                              
                                 var numfeatures = featurestoextract.length;
                                 
                                 featuredata = new Array(featuredata);
                                 
                                 
                                 var j=0, f = 0;
                                 
                                 for (j = 0; j < numblocks; ++j)
                                 featuredata[j] = new Array(numfeatures);
                                 
                                 
                                 var extractors = new Array(numfeatures);
                                 
                                 for (f = 0; f < numfeatures; ++f) {
                                 
                                 var featurestring = new String("new " + featurestoextract[f][0] + "("+self.sampleRate);
                                 
                                 if(featurestoextract[f].length>1) {
                                 
                                 for (j = 1; j < featurestoextract[f].length; ++j)
                                    featurestring += "," + featurestoextract[f][j];
                                 
                                 }
                                 
                                 featurestring += ")";
                                 
                                 //extractors[f] = eval("new " + featurestoextract[f][0] + "("+self.sampleRate+")"); //new featurestoextract[f];
                                 
                                 extractors[f] = eval(featurestring);
                                 
                                 //https://stackoverflow.com/questions/1366127/how-do-i-make-javascript-object-using-a-variable-string-to-define-the-class-name
                                 //var obj = eval("new " + classNameString + "()");
                                 //var obj = (Function('return new ' + classNameString))()h
                                 
                                 
                                 
                                 
                                 }
                                 
                                 console.log('Extracting features for: ',filename); //debug console message
                                 
                                 for (j = 0; j < numblocks; ++j) {
          
                                    updatefunction(j,numblocks);
                                 
                                 //needed since player accumulates to its output
                                    for (var i = 0; i < self.audioblocksize; ++i) self.inputAudio.monoinput[i] = self.inputAudio.inputL[i] = self.inputAudio.inputR[i] = 0.0;
                                 
                                    self.sampleplayer.render(self.inputAudio,self.audioblocksize);
                                 
                                    //extract features over this block
                                    for (f = 0; f < numfeatures; ++f) {
                                      featuredata[j][f] =  extractors[f].next(self.inputAudio.monoinput);
                                    }
                                 
                                 }
                                 
                                 
                                 resolve(featuredata); //return via Promise
                                 
                                 
                                 },self.audiocontext);
                           
                           })
        
        
    };


    
}

//put all the awkward Web Audio API setup code here



function MMLLWebAudioSetup(blocksize, inputtype, callback, setup) {
 
    var self = this;
    
    self.audioblocksize = blocksize;
    self.inputtype = inputtype;
    self.inputAudio = new MMLLInputAudio(self.audioblocksize);
    self.outputAudio = new MMLLOutputAudio(self.audioblocksize); //always stereo for now
    
    self.callback = callback;
    self.setup = setup;
    
    self.sampleRate = 0;
    self.audiocontext = 0;
    self.node = 0;
    self.numInputChannels = 1;
    //self.audionotrunning = 1;
    self.audiorunning = false;
    
    self.usingMicrophone = function() {
        
        return ((self.inputtype == 1) || (self.inputtype == 2));
    }
    
    
    self.initAudio = function(inputstream) {
        
        console.log('initialising audio'); //debug console message
        
        //delete previous if necessary
        if (self.audiorunning) {
            
            self.audiocontext.close(); //let previous go
        }
        
        //can request specific sample rate, but leaving as device's default for now
        //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext
        try {
            self.audiocontext = new webkitAudioContext();
            
        } catch (e) {
            
            try {
                
                self.audiocontext = new AudioContext();
                
            } catch(e) {
                
                alert("Your browser does not support Web Audio API!");
                return;
            }
            
        }
        
        self.sampleRate = self.audiocontext.sampleRate; //usually 44100.0
        
        console.log("AudioContext established with sample rate:",self.sampleRate," and now setting up for input type:",self.inputtype); //print
        
        self.setup(self.sampleRate);
        
        if((self.inputtype == 1) || (self.inputtype == 2)) {
            
            var audioinput = self.audiocontext.createMediaStreamSource(inputstream);
            
            self.numInputChannels = self.inputtype; //1 or 2 inputs
            
            self.inputAudio.numChannels = self.numInputChannels;
            
            self.node = self.audiocontext.createScriptProcessor(self.audioblocksize,self.numInputChannels,2); //1 or 2 inputs, 2 outputs
            
            audioinput.connect(self.node);
            
            self.node.onaudioprocess = self.process;  //this is nil since this isn't what you think it is here
            
            self.node.connect(self.audiocontext.destination);
            
        } else {
            
            
            if(self.inputtype == 0) {
             
                //no input
                
                self.node = self.audiocontext.createScriptProcessor(self.audioblocksize,0,2); //0 input, 2 outputs
                self.node.onaudioprocess = self.synthesizeAudio;
                
                //direct synthesis
                self.node.connect(self.audiocontext.destination);
                
            
            } else {
            
            //            self.node = self.audiocontext.createScriptProcessor(self.audioblocksize,0,2); //0 input, 2 outputs
            //
            //            self.node.onaudioprocess = self.processSoundFile;
            //
            self.initSoundFileRead(self.inputtype);
                
            }
            
        }
        
        self.audiorunning = true;
        //self.audionotrunning = 0;
        
    };
    
    self.initSoundFileRead = function(filename) {
        
        self.sampler = new MMLLSampler();
        //self.sampleplayer;
        //was Float64Array
        //self.samplearray = new Float32Array(audioblocksize);
        
        //"/sounds/05_radiohead_killer_cars.wav"
        self.sampler.loadSamples([filename],
                            function onload() {
                            
                            self.sampleplayer = new MMLLSamplePlayer();
                            self.sampleplayer.reset(self.sampler.buffers[0]);
                            //self.sampleplayer.numChannels = self.sampler.buffers[0]
                            
                            if(self.sampleplayer.numChannels>1) {
                            //interleaved input
                            self.numInputChannels = 2;
                            
                            self.inputAudio.numChannels = self.numInputChannels;
                            //self.samplearray = new Float32Array(2*audioblocksize);
                            
                            }
                            
                            //samplearray depends on number of Channels whether interleaved
                            
                            // This AudioNode will create the samples directly in JavaScript
                            //proceed with hop size worth of samples
                            self.node = self.audiocontext.createScriptProcessor(self.audioblocksize,0,2); //0 input, 2 outputs
                            self.node.onaudioprocess = self.processSoundFile;
                            
                            //direct synthesis
                            self.node.connect(self.audiocontext.destination);
                            
                            
                            },self.audiocontext);
        
    };
    
    self.synthesizeAudio = function(event) {
       
        // Get output arrays
        var outputArrayL = event.outputBuffer.getChannelData(0);
        var outputArrayR = event.outputBuffer.getChannelData(1);
        
        //number of samples to calculate is based on (common) length of these buffers
        var n = outputArrayL.length;
        
        var i;
        
        //safety, zero out output if accumulating to it
        for (var i = 0; i < n; ++i) outputArrayL[i] = outputArrayR[i] = 0.0;
        
        self.outputAudio.outputL = outputArrayL;
        self.outputAudio.outputR = outputArrayR;
        
        //no input argument, just synthesise output entirely
        self.callback(self.outputAudio,n);
        
    };
    
    
    
    self.processSoundFile = function(event) {
        // Get output arrays
        var outputArrayL = event.outputBuffer.getChannelData(0);
        var outputArrayR = event.outputBuffer.getChannelData(1);
        //var input = event.inputBuffer.getChannelData(0);

        //number of samples to calculate is based on (common) length of these buffers
        var n = outputArrayL.length; //outputArrayL.length;
        
        var i;
        //console.log("processSoundFile",event,n);
        
//        if(self.numInputChannels==2) {
//           
//            
//            
//            
//            for (i = 0; i< 2*n; ++i)
//                self.samplearray[i] = 0.0;
//            
//           
//        } else {
//        
//        //listening
//        for (i = 0; i< n; ++i)
//            self.samplearray[i] = 0.0;
//        
//        }
        
        //safety, zero out input if accumulating to it
        
        for (var i = 0; i < n; ++i) self.inputAudio.monoinput[i] = self.inputAudio.inputL[i] = self.inputAudio.inputR[i] = 0.0;
        
        
        //self.sampleplayer.render(self.samplearray,n);
        self.sampleplayer.render(self.inputAudio,n);
   
       
        //safety, zero out output if accumulating to it
        for (var i = 0; i < n; ++i) outputArrayL[i] = outputArrayR[i] = 0.0;
        
        self.outputAudio.outputL = outputArrayL;
        self.outputAudio.outputR = outputArrayR;
        
       
        
        
        //self.callback(inputL,outputArrayL,outputArrayR,n);
        self.callback(self.inputAudio,self.outputAudio,n);
        
        
        //self.callback(self.samplearray,outputArrayL,outputArrayR,n);
        
    };
    
    self.process = function(event) {
        // Get output arrays
        var outputArrayL = event.outputBuffer.getChannelData(0);
        var outputArrayR = event.outputBuffer.getChannelData(1);
        var inputL = event.inputBuffer.getChannelData(0);
       
        
        //number of samples to calculate is based on (common) length of these buffers
        var n = inputL.length; //outputArrayL.length;

        //console.log("process",event,n);
        
        //denormal safety checks on input
        
        for (var i = 0; i < n; ++i) {
            
            inputnow = inputL[i];
            
            //clip input deliberately to avoid blowing filters later
            if(inputnow>1.0) inputnow = 1.0;
            if(inputnow<-1.0) inputnow = -1.0;
            
            //subnormal floating point protection on input
            absx = Math.abs(inputnow);
            inputL[i] = (absx > 1e-15 && absx < 1e15) ? inputnow : 0.;
            
        }
        
        if(self.numInputChannels == 2) {
            var inputR = event.inputBuffer.getChannelData(1);
            
            
            for (var i = 0; i < n; ++i) {
                
                inputnow = inputR[i];
                
                //clip input deliberately to avoid blowing filters later
                if(inputnow>1.0) inputnow = 1.0;
                if(inputnow<-1.0) inputnow = -1.0;
                
                //subnormal floating point protection on input
                absx = Math.abs(inputnow);
                inputR[i] = (absx > 1e-15 && absx < 1e15) ? inputnow : 0.;
                
            }

            var left, right;
            var monoinput = self.inputAudio.monoinput;

            for (var i = 0; i < n; ++i) {
                
                left = inputL[i];
                right = inputR[i];
                monoinput[i] = (left+right)*0.5;
                
            }
            
            self.inputAudio.inputL = inputL;
            self.inputAudio.inputR = inputR;
            
            
        } else {
            
            self.inputAudio.monoinput = inputL;
            self.inputAudio.inputL = inputL;
            self.inputAudio.inputR = inputL;
            
//            left = self.inputAudio.inputL;
//            right = self.inputAudio.inputR;
//            
//            for (var i = 0; i < n; ++i) {
//                
//                left[i] = inputL[i];
//                right[i] = inputL[i];
//                
//            }
            
            
        }
        
        //safety, zero out output if accumulating to it
        for (var i = 0; i < n; ++i) outputArrayL[i] = outputArrayR[i] = 0.0;
        
        self.outputAudio.outputL = outputArrayL;
        self.outputAudio.outputR = outputArrayR;
        
        //self.callback(inputL,outputArrayL,outputArrayR,n);
        self.callback(self.inputAudio,self.outputAudio,n);
        
    };
    
    //if(self.audionotrunning) {
        
        console.log('init MMLLWebAudioSetup');
        
        //microphone input
        if(inputtype == 1 || inputtype == 2) {
            
            //navigator.mediaDevices.getUserMedia
            //https://stackoverflow.com/questions/37673000/typeerror-getusermedia-called-on-an-object-that-does-not-implement-interface
            
            if (!navigator.getUserMedia)
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                 navigator.mozGetUserMedia || navigator.msGetUserMedia;
            
            navigator.getUserMedia({audio:true}, self.initAudio, function(e) {
                                   alert('Error getting audio');
                                   console.log(e);
                                   });
            
            
        } else {
            
            self.initAudio();
            
        }
        
        
    //};
    
}

//put all the awkward Web Audio API setup code here

function MMLLBasicGUISetup(callback,setup,audioblocksize=256,microphone=true,audiofileload=true,parent) {
 
    var self = this;
    self.audionotrunning = true;
    self.webaudio;
    self.audioblocksize = audioblocksize;
    self.callback = callback;
    self.setup = setup;
    self.textnode;
    self.parent = parent;
    
    if (typeof self.parent === 'undefined') {
        self.parent = document.body; //default then is to append to end of current document
    }
    
//    <button onclick="initMic()">Open Microphone</button><br>
//    <button onclick="document.getElementById('file-input').click();">Open Audio File</button>
//    <input id="file-input" type="file" name="name" style="display: none;" /><br><br>
 
//    <canvas id="canvas" width="800" height="400">
//    This text is displayed if your browser does not support HTML5 Canvas.
//        </canvas>
    
//    var canvas = document.getElementById('canvas');
//    var context = canvas.getContext('2d');

    self.createStopButton = function() {
        
        self.stopbutton = document.createElement("BUTTON");        // Create a <button> element
        var t = document.createTextNode("Stop Audio");       // Create a text node
        self.stopbutton.appendChild(t);                                // Append the text to
        
        self.stopbutton.onclick = function() {
            
            if(self.audionotrunning==false) {
                
                //stop audio
                
                self.webaudio.audiocontext.close();
                
                self.audionotrunning = true;
                
                self.stopbutton.parentNode.removeChild(self.stopbutton);
                
                self.initGUI();
                
//                self.webaudio.context.close().then(function() {
//                            
//                                                   //reset GUI for new audio
//                                           self.stopbutton.parentNode.removeChild(self.stopbutton);
//                                                   
//                                            self.initGUI();
//                                                   });
//                await self.webaudio.context.close();
//                
            }
            
            
   
            
        }
        
        self.parent.appendChild(self.stopbutton);                    // Append <button> to <body>

        
    };
    
    
    self.initGUI = function() {
    
    if(microphone) {
        
    self.openmicbutton = document.createElement("BUTTON");        // Create a <button> element
    var t = document.createTextNode("Open Microphone");       // Create a text node
    self.openmicbutton.appendChild(t);                                // Append the text to <button>
    
        self.openmicbutton.onclick = function() {
            
            if(self.audionotrunning) {
                
                self.webaudio = new MMLLWebAudioSetup(self.audioblocksize,1,self.callback,self.setup);
                
                self.audionotrunning = false;
            }
            
          
            self.openmicbutton.parentNode.removeChild(self.openmicbutton);
            if(audiofileload)
                self.openaudiofilebutton.parentNode.removeChild(self.openaudiofilebutton);
            self.parent.removeChild(self.textnode);
            
            self.createStopButton();
            
            
        }
    
    self.parent.appendChild(self.openmicbutton);                    // Append <button> to <body>
    
    }
   
    self.textnode = document.createTextNode(' --- ');
    self.parent.appendChild(self.textnode);
    
    if(audiofileload) {
        
        self.inputfile = document.createElement('input');
        self.inputfile.type = "file";
        self.inputfile.style = "display: none;";
        
        self.inputfile.addEventListener("change",function uploadFile()
                                    {
                                    console.log(self.inputfile.files[0],self.inputfile.files[0].name);
                                    
                                    
                                    if(self.audionotrunning) {
                                    
                                    //pass in filename or 1 for audio input
                                    self.webaudio = new MMLLWebAudioSetup(self.audioblocksize,self.inputfile.files[0],self.callback,self.setup);
                                    
                                    //webaudio.initSoundFileRead(file_input.files[0]);
                                    
                                    self.audionotrunning = false;
                                    }
                                    
                                    }, false);
        
        self.parent.appendChild(self.inputfile);
        
        self.openaudiofilebutton = document.createElement("BUTTON");
        var t = document.createTextNode("Open Audio File");
        self.openaudiofilebutton.appendChild(t);
        
        
        self.openaudiofilebutton.onclick = function() {
        self.inputfile.click();
            
        self.openaudiofilebutton.parentNode.removeChild(self.openaudiofilebutton);
            if(microphone)
        self.openmicbutton.parentNode.removeChild(self.openmicbutton);
        self.parent.removeChild(self.textnode);
            
            self.createStopButton();
            
            
        };
        
       
        self.parent.appendChild(self.openaudiofilebutton);
        
        
    }
    
    };
    
    self.initGUI();
    
//    self.whateverfunction = function(inputarg) {
//        
//        console.log('initialise GUI'); //debug console message
//    
//    };
    
}


class IFFTProcessor extends AudioWorkletProcessor {
    
    //not allowed in a class, an only declare variables within constructor
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
    //var self = this;
    
    
    // Custom AudioParams can be defined with this static getter.
    static get parameterDescriptors() {
        return [{ name: 'gain', defaultValue: 1 },
                { name: 'numholes', defaultValue: 0 },
                { name: 'lpcutoff', defaultValue: 1024 }];
        
//        [{
//         name: 'customGain',
//         defaultValue: 1,
//         minValue: 0,
//         maxValue: 1,
//         automationRate: 'a-rate'
//         }]
    }
    
    //https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor
    //how to pass own argument to constructor
    
    constructor(options) {
        // The super constructor call is required.
        super();
        
        //console.log(options.numberOfInputs);
        
        //console.log(options.processorOptions.someUsefulVariable);
        
        //this.featureextractor =  new MMLLSensoryDissonance(sampleRate);
        //options.processorOptions.someUsefulVariable;
        
        this.fftsize = 1024;
        this.hopsize = 512;
        
        this.scalefactor = 1.0/this.fftsize;
        
        this.numholes = 0;
        this.lpcutoff = 1024;
        
        this.ifftoutput = new Float32Array(this.fftsize);
        this.oaoutput = new Float32Array(this.hopsize);
        this.oaoutputoffset = 0;
        
        this.stft = new MMLLSTFT(this.fftsize,this.hopsize,0); //no windowing
        
        
        this.overlapadd = new MMLLOverlapAdd(this.fftsize,this.hopsize,1); //triangle windows
        
        this.port.onmessage = (event) => {
            // Handling data from the node.
            console.log('IFFTProcessor',event.data);
        };
        
        //this.port.postMessage('Hi!');
    }
    
    
    //every 128 samples https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
    process(inputs, outputs, parameters) {
        const input = inputs[0][0];
        const output = outputs[0];
        
        //not stereo, just operate on mono for now (otherwise duplicate code in parallel for left and right streams)
        var ready = this.stft.next(input);
        
        if(ready) {
            
            var i;
            
            var fftdata = this.stft.complex;
            
            
            const holes = parameters['numholes'];
            var holesnow = holes[0];
            
            //zero random values
            for(i=0; i<holesnow; ++i) {
                var where = Math.floor(Math.random()* this.fftsize);
                
                fftdata[where] = 0.0;
            }
            
            const lpcutoff = parameters['lpcutoff'];
            var lpcutoffnow = lpcutoff[0];
            
            //low pass
            //<= to account for Nyquist bin at the top
            for(i=(2*lpcutoffnow); i<=this.fftsize; ++i) {
                fftdata[i] = 0.0;
            }
            
            this.stft.inverse(fftdata);
            
            for(i=0; i<this.fftsize; ++i)
                this.ifftoutput[i] = this.stft.inversereals[i] * this.scalefactor;
            
            this.overlapadd.next(this.ifftoutput,this.oaoutput);
            
            this.oaoutputoffset = 0;
            
        }
        
        //copy from oaoutput to actual sample output
    
        var offset = this.oaoutputoffset;
        
        const gain = parameters['gain'];
        var gainnow = gain[0];
        
        for (let channel = 0; channel < inputs[0].length; ++channel) {
            //const inputChannel = input[channel];
            const outputChannel = output[channel];
            
            for (i = 0; i < input.length; ++i) {
                
                var valnow = this.oaoutput[offset+i];
                
                outputChannel[i] = valnow * gainnow;
                
            }
            
        }
        
        this.oaoutputoffset =  (this.oaoutputoffset + 128)%512;
        
        
        //assumes input mono array of float samples
        //var dissonance = this.featureextractor.next(input[0]);
        
        //this.port.postMessage(dissonance);
       
        return true;
    }
}

registerProcessor('ifft-processor', IFFTProcessor);
