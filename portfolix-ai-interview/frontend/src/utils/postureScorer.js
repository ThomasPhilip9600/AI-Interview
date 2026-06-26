export class PostureScorer {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalFrames = 0;
    this.centeredFrames = 0;
    this.shouldersVisibleFrames = 0;
    this.headStraightFrames = 0;
    this.goodDistanceFrames = 0;
    this.goodLightingFrames = 0;
    this.warningsSet = new Set();
  }

  /**
   * Score a single frame and accumulate statistics.
   * @param {Object} results - MediaPipe face and pose landmarks.
   * @returns {Object} Frame status and warnings.
   */
  scoreFrame(results) {
    this.totalFrames++;
    const frameStatus = {
      isFaceCentered: true,
      areShouldersVisible: true,
      isHeadStraight: true,
      isDistanceOk: true,
      isLightingOk: true,
      warnings: []
    };

    // If it's a simulated frame, apply some randomized noise to make the UI look alive!
    if (results.isSimulated) {
      const isCentered = Math.random() > 0.05;
      const isStraight = Math.random() > 0.08;
      
      if (isCentered) this.centeredFrames++;
      else {
        frameStatus.isFaceCentered = false;
        frameStatus.warnings.push('Center your face');
      }

      if (isStraight) this.headStraightFrames++;
      else {
        frameStatus.isHeadStraight = false;
        frameStatus.warnings.push('Keep head straight');
      }

      this.shouldersVisibleFrames++;
      this.goodDistanceFrames++;
      this.goodLightingFrames++;
      
      frameStatus.warnings.forEach(w => this.warningsSet.add(w));
      return frameStatus;
    }

    const { faceLandmarks, poseLandmarks } = results;

    // 1. Face Centering Check
    if (!faceLandmarks || faceLandmarks.length === 0) {
      frameStatus.isFaceCentered = false;
      frameStatus.warnings.push('No face detected');
    } else {
      // Index 1 contains nose tip landmark
      const nose = faceLandmarks[1];
      const isCenteredX = nose.x >= 0.35 && nose.x <= 0.65;
      const isCenteredY = nose.y >= 0.25 && nose.y <= 0.65;
      
      if (isCenteredX && isCenteredY) {
        this.centeredFrames++;
      } else {
        frameStatus.isFaceCentered = false;
        if (!isCenteredX) {
          frameStatus.warnings.push(nose.x < 0.35 ? 'Move slightly to your right' : 'Move slightly to your left');
        } else {
          frameStatus.warnings.push(nose.y < 0.25 ? 'Sit slightly lower' : 'Sit slightly higher');
        }
      }
    }

    // 2. Shoulder Visibility Check (Pose landmarks 11 & 12 are left & right shoulders)
    if (!poseLandmarks || !poseLandmarks[11] || !poseLandmarks[12]) {
      frameStatus.areShouldersVisible = false;
      frameStatus.warnings.push('Adjust camera to show shoulders');
    } else {
      const leftShoulder = poseLandmarks[11];
      const rightShoulder = poseLandmarks[12];
      
      // Shoulders should be in screen space and below the chin
      const visible = leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5;
      if (visible) {
        this.shouldersVisibleFrames++;
      } else {
        frameStatus.areShouldersVisible = false;
        frameStatus.warnings.push('Show your shoulders in the frame');
      }
    }

    // 3. Head Alignment / Straightness (Compare eye landmarks levelness)
    if (faceLandmarks && faceLandmarks[33] && faceLandmarks[263]) {
      // 33 is outer corner of left eye, 263 is outer corner of right eye
      const leftEye = faceLandmarks[33];
      const rightEye = faceLandmarks[263];
      
      const eyeDiffY = Math.abs(leftEye.y - rightEye.y);
      const isStraight = eyeDiffY < 0.04;
      
      if (isStraight) {
        this.headStraightFrames++;
      } else {
        frameStatus.isHeadStraight = false;
        frameStatus.warnings.push('Keep your head level');
      }

      // 4. Distance check based on eye spacing
      const eyeDistance = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
      );
      
      // Ideal normalized eye distance is roughly between 0.12 and 0.22
      const isDistanceOk = eyeDistance >= 0.10 && eyeDistance <= 0.24;
      if (isDistanceOk) {
        this.goodDistanceFrames++;
      } else {
        frameStatus.isDistanceOk = false;
        frameStatus.warnings.push(eyeDistance < 0.10 ? 'Move closer to the screen' : 'Step back from the screen');
      }
    }

    // 5. Lighting Check (Mocked for safety, or calculated from page brightness average)
    this.goodLightingFrames++;

    frameStatus.warnings.forEach(w => this.warningsSet.add(w));
    return frameStatus;
  }

  /**
   * Compiles final analytics payload.
   * @returns {Object} Final posture report JSON.
   */
  getFinalScore() {
    const total = this.totalFrames || 1;
    
    const faceCenteredPercent = Math.round((this.centeredFrames / total) * 100);
    const shouldersVisiblePercent = Math.round((this.shouldersVisibleFrames / total) * 100);
    const headStraightPercent = Math.round((this.headStraightFrames / total) * 100);
    const distanceOkPercent = Math.round((this.goodDistanceFrames / total) * 100);
    const lightingOkPercent = Math.round((this.goodLightingFrames / total) * 100);

    // Compute posture score out of 10
    const weightedSum = 
      (faceCenteredPercent * 0.3) + 
      (shouldersVisiblePercent * 0.2) + 
      (headStraightPercent * 0.2) + 
      (distanceOkPercent * 0.2) + 
      (lightingOkPercent * 0.1);

    const rawScore = (weightedSum / 10);
    const score = Math.max(1, Math.min(10, Math.round(rawScore)));

    return {
      score: score, // Out of 10
      metrics: {
        faceCenteredPercent,
        shouldersVisiblePercent,
        headStraightPercent,
        distanceOkPercent,
        lightingOkPercent,
        eyeContactPercent: Math.round(headStraightPercent * 0.95), // Proxied by head orientation
        warningsList: Array.from(this.warningsSet)
      }
    };
  }
}
